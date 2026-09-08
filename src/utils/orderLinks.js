export function getOrderStoreId(order) {
  return order?.store?.id || order?.store_id || null;
}

export function getOrderCustomerId(order) {
  return order?.customer?.id || order?.user_id || null;
}

export function nestedRiderProfile(user) {
  if (!user) return null;
  return user.rider || user.Rider || null;
}

export function getOrderRiderProfileId(order) {
  const user = order?.delivery?.rider;
  return nestedRiderProfile(user)?.id || null;
}

export function getOrderStoreHref(order) {
  const id = getOrderStoreId(order);
  return id ? `/stores/${id}` : null;
}

export function getOrderCustomerHref(order) {
  const id = getOrderCustomerId(order);
  return id ? `/customers/${id}` : null;
}

export function getOrderRiderHref(order) {
  const id = getOrderRiderProfileId(order);
  return id ? `/riders/${id}` : null;
}

export function getOrderDeliveryHref(order) {
  const id = order?.id;
  return id ? `/deliveries?order_id=${id}` : null;
}

export function getOrderPaymentsHref(order) {
  const id = order?.id;
  return id ? `/payments?order_id=${id}` : null;
}

export function getOrderRefundsHref(order) {
  const id = order?.id;
  return id ? `/refunds?order_id=${id}` : null;
}

export function getOrderItemProductHref(item) {
  const id =
    item?.store_variant?.product_variant?.product?.id ||
    item?.store_variant?.product_variant?.product_id ||
    item?.snapshot?.product_id ||
    null;
  return id ? `/products/${id}` : null;
}

export function getOrderItemVariantHref(item) {
  const id = item?.store_variant?.product_variant?.id || item?.store_variant?.variant_id || null;
  return id ? `/product-variants/${id}` : null;
}

export function getRiderHrefFromUser(user) {
  const id = nestedRiderProfile(user)?.id;
  return id ? `/riders/${id}` : null;
}
