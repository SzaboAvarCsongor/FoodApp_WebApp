import { supabase } from '../supabaseClient.js';

export const createOrder = async (req, res) => {
  const { 
    customer_id, 
    restaurant_id, 
    delivery_address, 
    total_price, 
    total_calories, 
    items 
  } = req.body;

  if (!customer_id || !restaurant_id || !delivery_address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Hiányzó adatok a rendelés leadásához (customer_id, restaurant_id, delivery_address, items)!' });
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_id,
          restaurant_id,
          delivery_address,
          total_price,
          total_calories: total_calories || null,
          status: 'PENDING',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    const orderItemsToInsert = items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    res.status(201).json({
      message: 'Rendelés sikeresen rögzítve!',
      order: orderData,
    });
  } catch (err) {
    console.error('Rendelési hiba:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name))')
      .eq('customer_id', userId) 
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};