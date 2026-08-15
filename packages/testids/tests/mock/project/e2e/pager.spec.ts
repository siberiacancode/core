test('pager', async ({ page }) => {
  await page.getByTestId(TESTIDS.clickable.button.next).click();
  await page.getByTestId('static-label-title').isVisible();
  await page.getByTestId(TESTIDS.clickable.modal.close).click();
});
