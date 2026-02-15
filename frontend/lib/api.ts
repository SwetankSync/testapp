export async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(path, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!response.ok) throw new Error(`API failed ${response.status}`);
  return response.json();
}
