import { test, expect } from "../futures";
import * as metamask from "@synthetixio/synpress/commands/metamask";
import playwrightConfig from "../playwright.config";

// test.beforeEach(async ({ page }) => {
//   // baseUrl is set in playwright.config.ts
//   await page.goto("https://metamask.github.io/test-dapp/");
// });

// test("connect wallet using default metamask account", async ({ page }) => {
//   await page.click("#connectButton");
//   await metamask.acceptAccess();
//   await expect(page.locator("#accounts")).toHaveText(
//     "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
//   );
// });

// test("import private key and connect wallet using imported metamask account", async ({
//   page,
// }) => {
//   await metamask.importAccount(
//     "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"
//   );
//   await page.click("#connectButton");
//   await metamask.acceptAccess();
//   await expect(page.locator("#accounts")).toHaveText(
//     "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f"
//   );
// });

test("Increase Market Position", async ({ page }) => {
  test.setTimeout(1000 * 1000);
  const orderSize = 0.005;

  // add network
  await metamask.addNetwork({
    networkName: "Arbitrum Goerli",
    rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
    chainId: "421613",
    symbol: "AGOR",
    blockExplorer: "https://goerli-rollup-explorer.arbitrum.io",
    isTestnet: true,
  });
  // setup account
  await metamask.importAccount(
    "7a8b570d7755145b87a31cd3bf20f117316ddad29147168c0206335bfaba141b"
  );
  await page.goto(
    "https://next-dptp-git-release-dptp-positionex.vercel.app/dptp/trading/USD-M/ETH/BUSD"
  );
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByText("Metamask").click();
  await page.waitForTimeout(3000);
  await metamask.acceptAccess();

  // input order form
  // open market long
  // select lvr
  await page
    .locator(
      "xpath=/html/body/div[1]/main/div/div[2]/div[5]/div[2]/div/form/div/div[3]/div[1]/div[2]/div"
    )
    .click();
  await page.getByRole("spinbutton").clear();
  await page.getByRole("spinbutton").type("30");
  await page.getByRole("button", { name: "Confirm" }).click();
  // input quantity
  // select base/quote
  await page.getByTestId("select-quantity-token").locator("svg").click();
  await page.waitForTimeout(3000);
  await page
    .getByTestId("dropdown-select-quantity-token-ETH")
    .getByText("ETH")
    .click();
  // Get current position size
  await page
    .locator(
      'xpath=//*[@id="__next"]/main/div/div[2]/div[8]/div[2]/div/div/div[1]/div[3]/label/span'
    )
    .click();
  await page.waitForTimeout(3000);
  const positionSizeBefore = await page
    .locator(
      'xpath=//*[@id="tabs-:rk:--tabpanel-0"]/div/div/table/tbody/tr/td[2]/span[1]/span'
    )
    .innerText();
  const positionSizeBeforeNumber = parseFloat(positionSizeBefore);
  console.log(positionSizeBeforeNumber);
  await page.waitForTimeout(3000);
  await page
    .getByTestId("order-form-input-quantity")
    .type(orderSize.toString());
  await page.waitForTimeout(8000);
  // confirm orrder
  await page.getByTestId("order-form-btn-open-long").click();
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Confirm Long" }).click();
  await page.waitForTimeout(8000);

  await metamask.confirmTransaction();
  await page.waitForTimeout(20000);

  // await page.goto('chrome-extension://nkmnhpfolchbfnnfdoambinjibappkpc/home.html#');
  // await page.getByTestId('page-container-footer-next').click();

  // return page
  await page.goto(
    "https://next-dptp-git-release-dptp-positionex.vercel.app/dptp/trading/USD-M/ETH/BUSD"
  );
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByText("Metamask").click();
  await page.waitForTimeout(3000);

  // select base/quote
  await page.getByTestId("select-quantity-token").locator("svg").click();
  await page.waitForTimeout(3000);
  await page
    .getByTestId("dropdown-select-quantity-token-ETH")
    .getByText("ETH")
    .click();

  // Get current position size
  const positionSizeAfter = await page
    .locator(
      'xpath=//*[@id="tabs-:rk:--tabpanel-0"]/div/div/table/tbody/tr/td[2]/span[1]/span'
    )
    .innerText();
  const positionSizeAfterNumber = parseFloat(positionSizeAfter);
  console.log(positionSizeAfterNumber);

  // Expect quantity increase
  const delta = orderSize + positionSizeBeforeNumber;
  console.log(delta);
  const epsilon = 0.0001; // Define an acceptable margin of error

  await expect(
    Math.abs(positionSizeBeforeNumber + orderSize - positionSizeAfterNumber)
  ).toBeLessThan(epsilon);
});
