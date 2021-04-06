describe('サンプルテストスイート', () => {
  test('トップページでアプリ名が表示されていること', async () => {
    await page.goto('http://localhost:3000/')
    await expect(page.url()).toBe('http://localhost:3000/')
  })
})