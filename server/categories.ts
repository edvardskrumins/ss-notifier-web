"use server";

export async function getCategories() {
  console.log('fetch!', `${process.env.API_URL}/categories`);
  const response = await fetch(`${process.env.API_URL}/categories`);
  const json = await response.json();
  return json.data;
}