import { expect, test, type Page, type Route } from '@playwright/test';

type Plant = {
  id: number;
  name: string;
  species: string;
  frequency: number;
  frequencyType: 'DAYS' | 'TIMES_PER_DAY';
  image: string | null;
  lastWatered: string | null;
  createdAt: string;
  historyCount: number;
  todayCount?: number;
};

const user = {
  id: 'user-e2e-0001',
  nickname: '测试园丁',
  avatar: 'https://example.com/avatar.png',
  plantCount: 2,
  createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
};

const initialPlants = (): Plant[] => [
  {
    id: 1,
    name: '绿萝',
    species: '天南星科',
    frequency: 1,
    frequencyType: 'DAYS',
    image: null,
    lastWatered: null,
    createdAt: new Date().toISOString(),
    historyCount: 0,
    todayCount: 0,
  },
  {
    id: 2,
    name: '龟背竹',
    species: '龟背竹属',
    frequency: 3,
    frequencyType: 'DAYS',
    image: null,
    lastWatered: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    historyCount: 2,
    todayCount: 1,
  },
];

function envelope(data: unknown) {
  return { code: 200, status: 'normal', data };
}

async function fulfill(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    },
    body: JSON.stringify(data),
  });
}

async function mockApi(page: Page, seed: Plant[] = initialPlants()) {
  let plants = [...seed];
  let nextPlantId = 100;
  let nextWaterLogId = 1000;

  await page.route('http://localhost:3000/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (request.method() === 'OPTIONS') {
      return fulfill(route, null, 204);
    }

    if (path === '/api/auth/wechat/login' && request.method() === 'POST') {
      return fulfill(route, envelope({ token: 'e2e-token', user }));
    }

    if (path === '/api/auth/me' && request.method() === 'GET') {
      return fulfill(route, envelope({ ...user, plantCount: plants.length }));
    }

    if (path === '/api/plants/list' && request.method() === 'GET') {
      return fulfill(route, envelope(plants));
    }

    if (path === '/api/plants/add' && request.method() === 'POST') {
      const body = request.postDataJSON();
      const plant: Plant = {
        id: nextPlantId++,
        name: body.name,
        species: body.species,
        frequency: body.frequency,
        frequencyType: body.frequencyType,
        image: body.image ?? null,
        lastWatered: null,
        createdAt: new Date().toISOString(),
        historyCount: 0,
        todayCount: 0,
      };
      plants = [plant, ...plants];
      return fulfill(route, envelope(plant));
    }

    const infoMatch = path.match(/^\/api\/plants\/info\/(\d+)$/);
    if (infoMatch && request.method() === 'GET') {
      const plant = plants.find((item) => item.id === Number(infoMatch[1]));
      return fulfill(route, envelope({ ...plant, userId: user.id, history: [] }));
    }

    const deleteMatch = path.match(/^\/api\/plants\/delete\/(\d+)$/);
    if (deleteMatch && request.method() === 'POST') {
      plants = plants.filter((item) => item.id !== Number(deleteMatch[1]));
      return fulfill(route, envelope({ success: true }));
    }

    if (path === '/api/water-logs/add' && request.method() === 'POST') {
      const body = request.postDataJSON();
      const plantId = Number(body.plantId);
      const date = new Date().toISOString();
      plants = plants.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              lastWatered: date,
              historyCount: plant.historyCount + 1,
              todayCount: (plant.todayCount ?? 0) + 1,
            }
          : plant
      );
      return fulfill(route, envelope({ id: String(nextWaterLogId++), date }));
    }

    if (path === '/api/water-logs/calendar' && request.method() === 'GET') {
      return fulfill(
        route,
        envelope({
          year: url.searchParams.get('year'),
          month: url.searchParams.get('month'),
          data: { '1': [{ id: 1, name: '绿萝', image: null, count: 1 }] },
          summary: { totalWaterings: 1, totalPlants: 1, activeDays: 1 },
        })
      );
    }

    if (path === '/api/help-feedback/config' && request.method() === 'GET') {
      return fulfill(
        route,
        envelope({
          faqs: [
            {
              id: 'add-plant',
              question: '如何添加新的植物？',
              answer: '在首页点击右上角的绿色"+"按钮进入"添加新植物"页面。',
            },
            {
              id: 'delete-plant',
              question: '如何删除一棵植物？',
              answer: '点击底部左侧的垃圾桶按钮，然后在弹窗中点击"确认删除"。',
            },
          ],
          feedbackTypes: [
            { label: '报告问题', value: 'bug' },
            { label: '功能建议', value: 'suggestion' },
            { label: '其他反馈', value: 'other' },
          ],
          supportEmail: '296831450@qq.com',
        })
      );
    }

    if (path === '/api/help-feedback/submit' && request.method() === 'POST') {
      return fulfill(route, envelope({ id: 'feedback-1', status: 'submitted', submittedAt: new Date().toISOString() }));
    }

    return fulfill(route, { code: 404, status: 'error', data: { message: `Unhandled mock route: ${path}` } }, 404);
  });
}

async function openAsLoggedIn(page: Page, plants = initialPlants()) {
  await mockApi(page, plants);
  await page.addInitScript(() => localStorage.setItem('token', 'e2e-token'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '我的植物' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('user can log in and see the home dashboard', async ({ page }) => {
  await mockApi(page, []);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '绿植渴了' })).toBeVisible();
  await page.getByTestId('wechat-login-button').click();

  await expect(page.getByRole('heading', { name: '我的植物' })).toBeVisible();
  await expect(page.getByText('还没有添加植物，快去添加一株吧！')).toBeVisible();
});

test('home search filters plants by name', async ({ page }) => {
  await openAsLoggedIn(page);

  await expect(page.getByTestId('plant-card-1')).toContainText('绿萝');
  await expect(page.getByTestId('plant-card-2')).toContainText('龟背竹');

  await page.getByPlaceholder('搜索植物名称或种类…').fill('绿萝');
  await expect(page.getByTestId('plant-card-1')).toBeVisible();
  await expect(page.getByTestId('plant-card-2')).toBeHidden();
});

test('user can add a plant from the home screen', async ({ page }) => {
  await openAsLoggedIn(page, []);

  await page.getByTestId('add-plant-button').click();
  await expect(page.getByRole('heading', { name: '添加新植物' })).toBeVisible();

  await page.getByPlaceholder('如：发财树').fill('发财树');
  await page.getByPlaceholder('如：马拉巴栗').fill('马拉巴栗');
  await page.getByTestId('save-plant-button').click();

  await expect(page.getByRole('heading', { name: '我的植物' })).toBeVisible();
  await expect(page.getByTestId('plant-card-100')).toContainText('发财树');
  await expect(page.getByTestId('plant-card-100')).toContainText('马拉巴栗');
});

test('user can open details, record watering, and delete a plant', async ({ page }) => {
  await openAsLoggedIn(page, [
    {
      ...initialPlants()[0],
      frequency: 1,
      lastWatered: null,
      todayCount: 0,
    },
  ]);

  await page.getByTestId('plant-card-1').click();
  await expect(page.getByRole('heading', { name: '绿萝' })).toBeVisible();

  await page.getByTestId('water-plant-button').click();
  await expect(page.getByText('已记录浇水！')).toBeVisible();

  await page.getByTestId('delete-plant-button').click();
  await expect(page.getByText('删除 绿萝？')).toBeVisible();
  await page.getByRole('button', { name: '确认删除' }).click();

  await expect(page.getByRole('heading', { name: '我的植物' })).toBeVisible();
  await expect(page.getByText('还没有添加植物，快去添加一株吧！')).toBeVisible();
});

test('help and feedback FAQ opens and feedback can be submitted', async ({ page }) => {
  await openAsLoggedIn(page);

  await page.getByTestId('nav-profile').click();
  await page.getByRole('button', { name: /帮助与反馈/ }).click();
  await expect(page.getByRole('heading', { name: '帮助与反馈' })).toBeVisible();

  await page.getByRole('button', { name: '如何添加新的植物？' }).click();
  await expect(page.getByText('在首页点击右上角的绿色"+"按钮')).toBeVisible();

  await page.getByPlaceholder('请详细描述您的问题或建议...').fill('希望增加批量浇水功能');
  await page.getByPlaceholder('邮箱或微信').fill('tester@example.com');
  await page.getByRole('button', { name: '提交反馈' }).click();

  await expect(page.getByText('感谢反馈！')).toBeVisible();
});
