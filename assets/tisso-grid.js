// Variables must be global or shared to be accessible by all functions
let selectedVariant = null;
let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector(".tisso-popup");
  const closeBtn = document.querySelector(".popup-close");
  const addBtn = document.getElementById("add-to-cart");

  /* OPEN POPUP - Corrected selector to ".grid-item" */
  document.querySelectorAll(".grid-item").forEach((item) => {
    item.addEventListener("click", () => {
      try {
        currentProduct = JSON.parse(item.dataset.product);
      } catch (e) {
        console.error("Invalid product JSON", e);
        return;
      }

      // Populate Popup Data
      document.getElementById("popup-title").innerText = currentProduct.title;
      
      // Shopify prices are in cents (e.g. 1000 = $10.00)
      const formattedPrice = (currentProduct.variants[0].price / 100).toFixed(2);
      document.getElementById("popup-price").innerText = `$${formattedPrice}`;

      document.getElementById("popup-desc").innerHTML = currentProduct.description;
      document.getElementById("popup-image").src = currentProduct.featured_image;

      renderVariants(currentProduct);
      popup.classList.remove("hidden");
    });
  });

  /* CLOSE POPUP */
  closeBtn.addEventListener("click", () => popup.classList.add("hidden"));
  
  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.add("hidden");
  });

  /* ADD TO CART FUNCTIONALITY */
  addBtn.addEventListener("click", () => {
    if (!selectedVariant) return;

    // Prepare the items array for the Shopify AJAX API
    let itemsToAdd = [{
      id: selectedVariant.id,
      quantity: 1
    }];

    /* SPECIAL RULE: Black + Medium = Bonus Jacket */
    // Note: option1 is usually Color, option2 is usually Size
    if (selectedVariant.option1 === "Black" && selectedVariant.option2 === "Medium") {
      const jacketVariantId = 123456789; // Ensure this is a real ID in your test store
      itemsToAdd.push({
        id: jacketVariantId,
        quantity: 1
      });
    }

    // Use /cart/add.js to add multiple items at once
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemsToAdd })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Success:", data);
      popup.classList.add("hidden");
      
      // Optional: Redirect to cart or refresh to show the item
      window.location.href = '/cart'; 
    })
    .catch(error => {
      console.error("Error adding to cart:", error);
    });
  });
});

/* VARIANT RENDER */
function renderVariants(product) {
  const container = document.getElementById("variant-container");
  container.innerHTML = "";

  product.options.forEach((option, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "10px";

    const label = document.createElement("label");
    label.innerText = `${option.name}: `;
    
    const select = document.createElement("select");
    select.dataset.index = index;

    option.values.forEach(value => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.innerText = value;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => findVariant(product));
    
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  });

  findVariant(product); // Initialize selection for the first variant
}

/* FIND MATCHING VARIANT */
function findVariant(product) {
  const selects = document.querySelectorAll("#variant-container select");
  const selectedOptions = Array.from(selects).map(s => s.value);

  // Match the selected dropdown values with the product variant options
  const match = product.variants.find(v => 
    v.options.every((opt, i) => opt === selectedOptions[i])
  );

  if (match) {
    selectedVariant = match;
    const formattedPrice = (match.price / 100).toFixed(2);
    document.getElementById("popup-price").innerText = `$${formattedPrice}`;
  }
}