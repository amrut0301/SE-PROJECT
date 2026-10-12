
const foods = [
    {
        id: 1,
        name: "Margherita Pizza",
        description: "Classic cheese pizza with fresh tomato sauce.",
        price: 199,
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Cheese Burger",
        description: "Juicy burger with cheese and fresh vegetables.",
        price: 149,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Chicken Biryani",
        description: "Aromatic rice with delicious Indian spices.",
        price: 249,
        image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "French Fries",
        description: "Crispy golden fries served hot.",
        price: 99,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Veg Sandwich",
        description: "Fresh sandwich with vegetables and cheese.",
        price: 119,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Chocolate Dessert",
        description: "A sweet and creamy chocolate treat.",
        price: 129,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
    }
];

let cart = [];

const foodGrid = document.getElementById("food-grid");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery-fee");
const totalElement = document.getElementById("total");
const checkoutButton = document.getElementById("checkout-btn");
const searchInput = document.getElementById("search-input");
const noResults = document.getElementById("no-results");
const toast = document.getElementById("toast");

let toastTimer;

// Display food items
function displayFoods(items = foods) {
    foodGrid.innerHTML = "";

    noResults.hidden = items.length !== 0;

    items.forEach(food => {
        const card = document.createElement("article");
        card.className = "food-card";

        card.innerHTML = `
            <img src="${food.image}" alt="${food.name}"
                 loading="lazy">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <div class="food-bottom">
                    <span class="price">₹${food.price}</span>
                    <button class="add-btn" data-id="${food.id}">
                        + Add to Cart
                    </button>
                </div>
            </div>
        `;

        foodGrid.appendChild(card);
    });
}

// Search food items
function searchFoods() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query)
    );

    displayFoods(filteredFoods);
}

document.getElementById("search-btn")
    .addEventListener("click", searchFoods);

searchInput.addEventListener("input", searchFoods);

// Show notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Add food to cart
foodGrid.addEventListener("click", event => {
    const button = event.target.closest(".add-btn");

    if (!button) return;

    const foodId = Number(button.dataset.id);
    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    const existingItem = cart.find(item => item.id === foodId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...food,
            quantity: 1
        });
    }

    renderCart();
    showToast(food.name + " added to cart!");
});

// Increase, decrease, or remove cart items
cartItems.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) return;

    const id = Number(button.dataset.id);
    const item = cart.find(product => product.id === id);

    if (!item) return;

    if (button.classList.contains("increase")) {
        item.quantity++;
    }

    if (button.classList.contains("decrease")) {
        item.quantity--;

        if (item.quantity <= 0) {
            cart = cart.filter(product => product.id !== id);
        }
    }

    if (button.classList.contains("remove-btn")) {
        cart = cart.filter(product => product.id !== id);
        showToast("Item removed from cart.");
    }

    renderCart();
});

// Display cart and calculate bill
function renderCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty. Add some delicious food!
            </p>
        `;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>₹${item.price} × ${item.quantity}
                   = ₹${item.price * item.quantity}</p>
            </div>

            <div class="quantity-controls">
                <button class="decrease" data-id="${item.id}"
                        aria-label="Decrease ${item.name}">−</button>

                <span>${item.quantity}</span>

                <button class="increase" data-id="${item.id}"
                        aria-label="Increase ${item.name}">+</button>

                <button class="remove-btn" data-id="${item.id}">
                    Remove
                </button>
            </div>
        `;

        cartItems.appendChild(row);
    });

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const deliveryFee = subtotal === 0 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const itemCount = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    cartCount.textContent = itemCount;
    subtotalElement.textContent = "₹" + subtotal;
    deliveryElement.textContent = "₹" + deliveryFee;
    totalElement.textContent = "₹" + total;

    checkoutButton.disabled = cart.length === 0;
}

// Place order
checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Please add food to your cart first.");
        return;
    }

    const orderNumber =
        "QB" + Date.now().toString().slice(-8);

    const orderTotal = totalElement.textContent;

    showToast(
        "Order " + orderNumber +
        " placed successfully! Total: " + orderTotal
    );

    cart = [];
    renderCart();

    window.setTimeout(() => {
        document.getElementById("home").scrollIntoView({
            behavior: "smooth"
        });
    }, 1800);
});

// Initial display
displayFoods();
renderCart();
