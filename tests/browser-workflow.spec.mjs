import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';

test('browser signup, RFQ, supplier, quote and logout workflow',async({page})=>{
  const email=`browser-${randomUUID()}@example.invalid`;
  await page.goto('/');
  await page.getByRole('button',{name:/create account/i}).click();
  await page.getByLabel('Name').fill('Browser QA');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Disposable!BrowserQA123');
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Procurement dashboard'})).toBeVisible();
  await page.getByLabel('Product name').fill('Browser QA pH meter');
  await page.getByLabel('Quantity').fill('2');
  await page.getByRole('button',{name:'Save request'}).click();
  await expect(page.getByText('Browser QA pH meter')).toBeVisible();
  await page.getByRole('button',{name:'Suppliers',exact:true}).click();
  await page.getByLabel('Company').fill('Browser QA Supplier');
  await page.getByRole('button',{name:'Save supplier'}).click();
  await expect(page.getByText('Browser QA Supplier')).toBeVisible();
  await page.getByRole('button',{name:'Quotations',exact:true}).click();
  await page.getByLabel('Total quoted amount (₹)').fill('125.50');
  await page.getByRole('button',{name:'Save quotation'}).click();
  await expect(page.getByText(/₹125\.5/)).toBeVisible();
  await page.getByRole('button',{name:'Log out'}).click();
  await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
});
