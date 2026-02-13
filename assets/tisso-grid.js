document.addEventListener("DOMContentLoaded", () => {

  const popup = document.querySelector(".tisso-popup");
  const closeBtn = document.querySelector(".popup-close");
  const addBtn = document.getElementById("add-to-cart");

  let selectedVariant = null;
  let currentProduct = null;

  /* OPEN POPUP */

  document.querySelectorAll(".grid-item").forEach(item => {
    item.addEventListener("click", () => {

      try {
        currentProduct = JSON.parse(item.dataset.product);
      } catch {
        console.error("Invalid product JSON");
        return;
      }

      document.getElementById("popup-title").innerText =
        currentProduct.title;

      document.getElementById("popup-price").innerText =
        Shopify.formatMoney(currentProduct.variants[0].price);

      document.getElementById("popup-desc").innerHTML =
        currentProduct.description;

      document.getElementById("popup-image").src =
        currentProduct.featured_image;

      renderVariants(currentProduct);

      popup.classList.remove("hidden");
    });
  });

  /* CLOSE POPUP */

  closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.add("hidden");
  });

  /* ADD TO CART */

  addBtn.addEventListener("click", () => {

    if (!selectedVariant) return;

    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedVariant.id,
        quantity: 1
      })
    });

    /* SPECIAL RULE */

    if (selectedVariant.option1 === "Black" &&
        selectedVariant.option2 === "Medium") {

      const jacketVariantId = 123456789; // replace real ID

      fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: jacketVariantId,
          quantity: 1
        })
      });
    }

    popup.classList.add("hidden");
  });

});


/* VARIANT RENDER */

function renderVariants(product) {

  const container = document.getElementById("variant-container");
  container.innerHTML = "";

  product.options.forEach((option, index) => {

    const select = document.createElement("select");
    select.dataset.index = index;

    option.values.forEach(value => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.innerText = value;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => findVariant(product));
    container.appendChild(select);
  });

  findVariant(product);
}


/* FIND MATCHING VARIANT */

function findVariant(product) {

  const selects =
    document.querySelectorAll("#variant-container select");

  const selectedOptions =
    Array.from(selects).map(s => s.value);

  const match = product.variants.find(v =>
    JSON.stringify(v.options) === JSON.stringify(selectedOptions)
  );

  if (match) selectedVariant = match;
}
