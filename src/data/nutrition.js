// 100 days of healthy food for the Third-Tier.
// Each day: { day, breakfast, lunch, dinner, snacks, totalKcal }

const B = [
  { name: 'Oatmeal with sliced banana and honey', kcal: 290 },
  { name: 'Greek yogurt with granola and berries', kcal: 320 },
  { name: 'Two boiled eggs with whole-wheat toast', kcal: 280 },
  { name: 'Bubur ayam (chicken porridge) with herbs', kcal: 330 },
  { name: 'Banana pancakes with a little peanut butter', kcal: 350 },
  { name: 'Veggie omelette with tomato and spinach', kcal: 310 },
  { name: 'Fruit salad with chia seeds and yogurt', kcal: 280 },
  { name: 'Nasi uduk with boiled egg and cucumber', kcal: 380 },
  { name: 'Sweet corn with milk and banana', kcal: 300 },
  { name: 'Avocado smoothie with old-fashioned oats', kcal: 340 },
  { name: 'Overnight oats with grated apple and cinnamon', kcal: 300 },
  { name: 'Tofu scramble on whole-wheat toast', kcal: 290 }
];

const L = [
  { name: 'Grilled chicken, brown rice and steamed veggies', kcal: 520 },
  { name: 'Beef stir-fry with broccoli', kcal: 540 },
  { name: 'Salmon fillet with quinoa and asparagus', kcal: 550 },
  { name: 'Tuna salad in a whole-wheat wrap', kcal: 430 },
  { name: 'Tempeh stir-fry with white rice', kcal: 480 },
  { name: 'Gado-gado (mixed vegetables in peanut sauce) with brown rice', kcal: 490 },
  { name: 'Chicken soto with a bowl of rice', kcal: 500 },
  { name: 'Baked fish with potato wedges and greens', kcal: 460 },
  { name: 'Chicken curry with basmati rice', kcal: 560 },
  { name: 'Vegetable soup with grilled chicken', kcal: 420 },
  { name: 'Healthy nasi goreng (less oil) with chicken', kcal: 520 },
  { name: 'Rice with fish satay and vegetables', kcal: 510 },
  { name: 'Chicken katsu with rice and fresh salad', kcal: 540 },
  { name: 'Sayur asem and chicken with rice', kcal: 470 }
];

const D = [
  { name: 'Vegetable soup with soft tofu', kcal: 310 },
  { name: 'Grilled fish fillet with steamed vegetables', kcal: 340 },
  { name: 'Tofu and mushroom stir-fry', kcal: 330 },
  { name: 'Chicken breast with a crisp garden salad', kcal: 350 },
  { name: 'Omelette loaded with vegetables', kcal: 320 },
  { name: 'Sweet potato with a tuna salad', kcal: 360 },
  { name: 'Lentil soup with whole-wheat toast', kcal: 330 },
  { name: 'Steamed broccoli with garlic shrimp', kcal: 340 },
  { name: 'Chicken and vegetable stir-fry', kcal: 360 },
  { name: 'Miso soup with tofu and a small bowl of rice', kcal: 300 },
  { name: 'Ground beef taco salad', kcal: 350 },
  { name: 'Capcay (mixed vegetables) with chicken', kcal: 320 },
  { name: 'Light fish curry with vegetables', kcal: 330 },
  { name: 'Zucchini noodles with tomato sauce and chicken', kcal: 310 }
];

const SN = [
  'A handful of almonds',
  'One apple with peanut butter',
  'Carrot and cucumber sticks with hummus',
  'A boiled egg and a small orange',
  'Greek yogurt with a drizzle of honey',
  'A small bowl of melon or papaya',
  'Whole-wheat crackers with cheese slice',
  'A banana with rice crackers'
];

const TIPS = [
  'Drink a large glass of water before every meal.',
  'Eat slowly and stop when you are comfortably full.',
  'Keep dinner light and at least 3 hours before sleeping.',
  'Add one extra serving of vegetables to your plate today.',
  'Choose wholegrain versions of rice or bread when possible.',
  'Limit fried foods today; steam, grill or boil instead.',
  'Take a short 10-minute walk after lunch to aid digestion.',
  'Reduce added sugar today. Read the label of your drink.',
  'Include at least one source of protein in every meal.',
  'Fruit makes a perfect dessert when you crave something sweet.'
];

export const NUTRITION_DAYS = (function build100() {
  const days = [];
  for (let day = 1; day <= 100; day++) {
    const b = B[(day * 5) % B.length];
    const l = L[(day * 7) % L.length];
    const d = D[(day * 11) % D.length];
    const snack = SN[(day * 3) % SN.length];
    const tip = TIPS[(day * 2) % TIPS.length];
    days.push({
      day,
      breakfast: b,
      lunch: l,
      dinner: d,
      snack,
      tip,
      totalKcal: b.kcal + l.kcal + d.kcal
    });
  }
  return days;
})();