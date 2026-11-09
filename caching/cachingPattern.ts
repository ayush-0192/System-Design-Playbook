// cache aside pattern hit->serve || not hit -> call db invalidate cache on update if not than stale data
async function getMenu(restaurantId: string) {
  const key = `menu:${restaurantId}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const menu = await db.queryMenu(restaurantId);
  await redis.set(key, JSON.stringify(menu), { EX: 1800 }); // 30 min
  return menu;
}

async function updateMenu(restaurantId: string, menu: Menu) {
  await db.saveMenu(restaurantId, menu);
  await redis.del(`menu:${restaurantId}`); // invalidate; do not skip this
}
