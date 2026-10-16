import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';

test('disposable browser signup, RFQ, supplier, quote and logout',async({page})=>{
  const email=`browser-${randomUUID()}@example.invalid`;
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100');
  await page.getByRole('button',{name:'New here? Create account'}).click();
  await page.getByRole('textbox',{name:'Name'}).fill('Browser QA');
  await page.getByRole('textbox',{name:'Email'}).fill(email);
  await page.getByLabel('Password').fill('Disposable!BrowserQA123');
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Procurement dashboard'})).toBeVisible();
  await page.getByRole('textbox',{name:'Product name'}).fill('Browser QA pH meter');
  await page.getByRole('spinbutton',{name:'Quantity'}).fill('2');
  await page.getByRole('button',{name:'Save request'}).click();
  await expect(page.getByText('Browser QA pH meter').first()).toBeVisible();
  await page.getByRole('button',{name:'Suppliers',exact:true}).click();
  await page.getByRole('textbox',{name:'Company'}).fill('Browser QA Supplier');
  await page.getByRole('button',{name:'Save supplier'}).click();
  await expect(page.getByText('Browser QA Supplier').first()).toBeVisible();
  await page.getByRole('button',{name:'Quotations',exact:true}).click();
  await page.getByRole('spinbutton',{name:'Total quoted amount (₹)'}).fill('125.50');
  await page.getByRole('button',{name:'Save quotation'}).click();
  await expect(page.getByText(/₹125\.5/)).toBeVisible();
  await page.getByRole('button',{name:'Log out'}).click();
  await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
});
