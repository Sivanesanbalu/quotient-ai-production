import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';

test('disposable browser signup, RFQ, supplier, quote and logout',async({page})=>{
  const email=`browser-${randomUUID()}@example.invalid`;
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100');
  await page.getByRole('button',{name:'New here? Create account'}).click();
  await page.getByRole('textbox',{name:'Name'}).fill('Browser QA');
  await page.getByRole('textbox',{name:'Email'}).fill(email);
  await page.getByLabel('Password').fill('Disposable!BrowserQA123');
  const registration=page.waitForResponse(response=>response.url().endsWith('/api/auth/register')&&response.request().method()==='POST');
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  const registrationResponse=await registration;
  expect(registrationResponse.status(),await registrationResponse.text()).toBe(201);
  await expect(page.getByRole('heading',{name:'Procurement dashboard'})).toBeVisible({timeout:10000});
  await page.getByRole('textbox',{name:'Product name'}).fill('Browser QA pH meter');
  await page.getByRole('spinbutton',{name:'Quantity'}).fill('2');
  const savedRequest=page.waitForResponse(response=>response.url().endsWith('/api/rfqs')&&response.request().method()==='POST');
  await page.getByRole('button',{name:'Save request'}).click();
  const savedRequestResponse=await savedRequest;
  expect(savedRequestResponse.status(),await savedRequestResponse.text()).toBe(201);
  await expect(page.getByText('Browser QA pH meter').first()).toBeVisible({timeout:10000});
  await page.getByRole('button',{name:'Suppliers',exact:true}).click();
  await page.getByRole('textbox',{name:'Company'}).fill('Browser QA Supplier');
  await page.getByRole('button',{name:'Save supplier'}).click();
  await expect(page.getByText('Browser QA Supplier').first()).toBeVisible();
  await page.getByRole('button',{name:'Quotations',exact:true}).click();
  await page.getByRole('spinbutton',{name:'Total quoted amount (₹)'}).fill('125.50');
  await page.getByRole('button',{name:'Save quotation'}).click();
  await expect(page.getByText(/₹125\.5/)).toBeVisible();
  const logoutResponse=page.waitForResponse(response=>response.url().endsWith('/api/auth/logout')&&response.request().method()==='POST');
  await page.getByRole('button',{name:'Log out'}).click();
  const loggedOut=await logoutResponse;
  expect(loggedOut.status(),await loggedOut.text()).toBe(200);
  await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible({timeout:10000});
});

// Browser flow is intentionally exercised against an isolated CI PostgreSQL service.
