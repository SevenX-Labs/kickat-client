import { Bone, Sparkles, Scissors, Utensils, Droplets, Thermometer, Sun, Package, Wrench, HeartPulse, ShieldPlus } from 'lucide-react';

export const megaMenuData = {
  Dogs: {
    categoryHref: "/categories/dogs",
    image: "/images/nav/nav_dog.png",
    sidebar: [
      { id: "food", label: "Dog Food & Treats", Icon: Bone },
      { id: "accessories", label: "Dog Accessories", Icon: Sparkles },
      { id: "grooming", label: "Dog Grooming & Hygiene", Icon: Scissors },
      { id: "feeding", label: "Dog Feeding", Icon: Utensils },
    ],
    content: {
      food: [
        {
          title: "Food & Treats",
          items: [
            { name: "Dry Food", href: "/category/dogs/dog-food-treats" },
            { name: "Wet Food", href: "/category/dogs/dog-food-treats" },
            { name: "Treats & Biscuits", href: "/category/dogs/dog-food-treats" },
            { name: "Puppy Food", href: "/category/dogs/dog-food-treats" }
          ]
        },
        {
          title: "Shop by Life Stage",
          items: [
            { name: "Puppy (0-12 Months)", href: "/category/dogs/dog-food-treats" },
            { name: "Adult (1-7 Years)", href: "/category/dogs/dog-food-treats" },
            { name: "Senior (7+ Years)", href: "/category/dogs/dog-food-treats" }
          ]
        },
        {
          title: "Shop by Size",
          items: [
            { name: "Small Breeds", href: "/category/dogs/dog-food-treats" },
            { name: "Medium Breeds", href: "/category/dogs/dog-food-treats" },
            { name: "Large Breeds", href: "/category/dogs/dog-food-treats" }
          ]
        }
      ],
      accessories: [
        {
          title: "Dog Accessories",
          items: [
            { name: "Collars & Leashes", href: "/category/dogs/dog-accessories" },
            { name: "Harnesses", href: "/category/dogs/dog-accessories" },
            { name: "Beds & Mats", href: "/category/dogs/dog-accessories" }
          ]
        }
      ],
      grooming: [
        {
          title: "Grooming & Hygiene",
          items: [
            { name: "Shampoos", href: "/category/dogs/dog-grooming-hygiene" },
            { name: "Brushes", href: "/category/dogs/dog-grooming-hygiene" },
            { name: "Dental Care", href: "/category/dogs/dog-grooming-hygiene" }
          ]
        }
      ],
      feeding: [
        {
          title: "Dog Feeding",
          items: [
            { name: "Bowls", href: "/category/dogs/dog-feeding" },
            { name: "Slow Feeders", href: "/category/dogs/dog-feeding" },
            { name: "Water Dispensers", href: "/category/dogs/dog-feeding" }
          ]
        }
      ]
    }
  },
  Cats: {
    categoryHref: "/categories/cats",
    image: "/images/nav/nav_cat.png",
    sidebar: [
      { id: "food", label: "Cat Food", Icon: Bone },
      { id: "accessories", label: "Cat Accessories", Icon: Sparkles },
      { id: "grooming", label: "Cat Grooming & Hygiene", Icon: Scissors },
      { id: "feeding", label: "Cat Feeding", Icon: Utensils },
    ],
    content: {
      food: [
        {
          title: "Cat Food",
          items: [
            { name: "Dry Food", href: "/category/cats/cat-food" },
            { name: "Wet Food", href: "/category/cats/cat-food" },
            { name: "Kitten Food", href: "/category/cats/cat-food" }
          ]
        },
        {
          title: "Shop by Life Stage",
          items: [
            { name: "Kitten", href: "/category/cats/cat-food" },
            { name: "Adult", href: "/category/cats/cat-food" },
            { name: "Senior", href: "/category/cats/cat-food" }
          ]
        }
      ],
      accessories: [
        {
          title: "Cat Accessories",
          items: [
            { name: "Toys", href: "/category/cats/cat-accessories" },
            { name: "Scratchers", href: "/category/cats/cat-accessories" },
            { name: "Beds", href: "/category/cats/cat-accessories" }
          ]
        }
      ],
      grooming: [
        {
          title: "Grooming & Hygiene",
          items: [
            { name: "Litter Boxes", href: "/category/cats/cat-grooming-hygiene" },
            { name: "Cat Litter", href: "/category/cats/cat-grooming-hygiene" },
            { name: "Brushes", href: "/category/cats/cat-grooming-hygiene" }
          ]
        }
      ],
      feeding: [
        {
          title: "Cat Feeding",
          items: [
            { name: "Bowls", href: "/category/cats/cat-feeding" },
            { name: "Fountains", href: "/category/cats/cat-feeding" }
          ]
        }
      ]
    }
  },
  Fish: {
    categoryHref: "/categories/fish",
    image: "/images/nav/nav_fish.png",
    sidebar: [
      { id: "food", label: "Aquarium Food", Icon: Bone },
      { id: "filtration", label: "Aquarium Filtration", Icon: Droplets },
      { id: "pumps", label: "Aquarium Pumps", Icon: HeartPulse },
      { id: "heating", label: "Aquarium Heating", Icon: Thermometer },
      { id: "lighting", label: "Aquarium Lighting", Icon: Sun },
      { id: "care", label: "Aquarium Care & Medicine", Icon: ShieldPlus },
      { id: "tools", label: "Aquarium Tools", Icon: Wrench },
    ],
    content: {
      food: [
        {
          title: "Aquarium Food",
          items: [
            { name: "Flakes", href: "/category/fish/aquarium-food" },
            { name: "Pellets", href: "/category/fish/aquarium-food" }
          ]
        }
      ],
      filtration: [
        {
          title: "Filtration",
          items: [
            { name: "Filters", href: "/category/fish/aquarium-filtration" },
            { name: "Media", href: "/category/fish/aquarium-filtration" }
          ]
        }
      ],
      pumps: [
        {
          title: "Pumps",
          items: [
            { name: "Air Pumps", href: "/category/fish/aquarium-pumps" },
            { name: "Water Pumps", href: "/category/fish/aquarium-pumps" }
          ]
        }
      ],
      heating: [
        {
          title: "Heating",
          items: [
            { name: "Heaters", href: "/category/fish/aquarium-heating" },
            { name: "Thermometers", href: "/category/fish/aquarium-heating" }
          ]
        }
      ],
      lighting: [
        {
          title: "Lighting",
          items: [
            { name: "LED Lights", href: "/category/fish/aquarium-lighting" }
          ]
        }
      ],
      care: [
        {
          title: "Care & Medicine",
          items: [
            { name: "Water Conditioners", href: "/category/fish/aquarium-care-medicine" },
            { name: "Medicines", href: "/category/fish/aquarium-care-medicine" }
          ]
        }
      ],
      tools: [
        {
          title: "Tools",
          items: [
            { name: "Cleaning Tools", href: "/category/fish/aquarium-tools" },
            { name: "Nets", href: "/category/fish/aquarium-tools" }
          ]
        }
      ]
    }
  },
  Birds: {
    categoryHref: "/categories/birds",
    image: "/images/nav/nav_bird.png",
    sidebar: [
      { id: "food", label: "Bird Food", Icon: Bone },
      { id: "feeding", label: "Bird Feeding", Icon: Utensils },
    ],
    content: {
      food: [
        {
          title: "Bird Food",
          items: [
            { name: "Seed Mixes", href: "/category/birds/bird-food" },
            { name: "Pellets", href: "/category/birds/bird-food" }
          ]
        }
      ],
      feeding: [
        {
          title: "Bird Feeding",
          items: [
            { name: "Bowls & Cups", href: "/category/birds/bird-feeding" },
            { name: "Waterers", href: "/category/birds/bird-feeding" }
          ]
        }
      ]
    }
  }
};
