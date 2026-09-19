const fs = require('fs');

const apiPath = 'src/api.ts';
let apiCode = fs.readFileSync(apiPath, 'utf8');

if (!apiCode.includes('getTariffs')) {
  const newApiFuncs = `
  getTariffs: () => request<any[]>('/api/tariffs'),
  updateTariff: (id: string, data: any) => request<any>(\`/api/tariffs/\${id}\`, { method: 'PUT', body: JSON.stringify(data) }),
  createTariff: (data: any) => request<any>('/api/tariffs', { method: 'POST', body: JSON.stringify(data) }),
  deleteTariff: (id: string) => request<any>(\`/api/tariffs/\${id}\`, { method: 'DELETE' }),
  
  getPaymentRequests: () => request<any[]>('/api/payment-requests'),
  confirmPaymentRequest: (id: string) => request<any>(\`/api/payment-requests/\${id}/confirm\`, { method: 'PUT' }),
  rejectPaymentRequest: (id: string) => request<any>(\`/api/payment-requests/\${id}/reject\`, { method: 'PUT' }),
  updateRestaurantTariff: (id: string, tariffId: string, months: number) => request<any>(\`/api/superadmin/restaurants/\${id}/tariff\`, { method: 'PUT', body: JSON.stringify({ tariffId, months }) }),
`;

  apiCode = apiCode.replace(/export const superAdminApi = \{/, 'export const superAdminApi = {' + newApiFuncs);
  fs.writeFileSync(apiPath, apiCode);
  console.log('Patched api.ts');
}
