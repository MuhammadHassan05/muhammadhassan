document.addEventListener("DOMContentLoaded", () =>{
  const popup = document.querySelector(".tisso-popup");
    const closeBtn = document.querySelector(".popup-close");

    let selectedVariant = null;
    let currentProduct = null;

    document.querySelectorAll(".grid-item").forEach(item => {

        item.addEventListener("click", () => {

            currentProduct = JSON.parse(item.CDATA_SECTION_NODE.product);

            document.getElementById("popup-title").innerText = currentProduct.title;

            document.getElementById("popup-price").innerText = Shopify.formatMoney(currentProduct.price);;

            document.getElementById("popup-desc").innerHTML = currentProduct.description;

            document.getElementById("popup-image").src = currentProduct.featured_image;

            renderVariants(currentProduct);
            popup.classList.remove("hidden");

        });
    });

    closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
    });
});

function renderVariants(product) {

    const container = document.getElementById("variant-container");
    container.innerHTML = "";
    product.options.ForEach((option, index) => {
        let select = document.createElement("select");
        select.dataset.index = index;
        option.values.forEach(value => {
            let opt = document.createElement("option");
            opt.value = value;
            opt.innerText = value;
            select.appendChild(opt);
        });
        container.appendChild(select);
    });

    container.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", () => {
            findVariant(product);

        });
    });
    
    findVariant(product);
}

function findVariant(product) {
    const selects = document.querySelectorAll("#variant-container select");
    let selectedOptions = Array.from(selects).map(s => s.value);

    let match = product.variants.find(v => 
        JSON.stringify(v.options) === JSON.stringify(selectedOptions)
    );  

    if (match) {
        selectedVariant = match;
    
    }

}

document.getElementById("add-to-cart").addEventListener("click", () => {
    if (!selectedVariant) return;

    fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedVariant.id, quantity: 1 })
    })  
});

if(selectedVariant.option1 === "Black" && selectedVariant.option2 === "Medium") { 
    
    const jacketVariantId = 123456789; 

    fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jacketVariantId, quantity: 1 })
    });      

}
