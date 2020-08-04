let all_recipe_object = [];
let added_Ingredients = [];
let excluded_Ingredients = [];
let ids_array = [];
let unsorted_array = [];
let sorted = [];
var li_b;
var b;
let groupIds = [];
const intolerance_names = [];
const restrictions_names = [];
let intolerances_array = [];
let restrictions_array = [];
let user_intolerances_names = [];
let user_restrictions_names = [];
var queryKeyword;
var user_i_string, user_r_string;
let recipe_container = document.querySelector("#recipe_container");
let JSON_in_progress = false;
let shopping_aisles = [ "Baking",
                        "Health Foods",
                        "Spices and Seasonings",
                        "Pasta and Rice",
                        "Bakery/Bread",
                        "Refrigerated",
                        "Canned and Jarred",
                        "Frozen",
                        "Nut butters, Jams, and Honey",
                        "Oil, Vinegar, Salad Dressing",
                        "Condiments",
                        "Savory Snacks",
                        "Milk, Eggs, Other Dairy",
                        "Ethnic Foods",
                        "Tea and Coffee",
                        "Meat",
                        "Gourmet",
                        "Sweet Snacks",
                        "Gluten Free",
                        "Alcoholic Beverages",
                        "Cereal",
                        "Nuts",
                        "Beverages",
                        "Produce",
                        "Not in Grocery Store/Homemade",
                        "Seafood",
                        "Cheese",
                        "Dried Fruits",
                        "Online",
                        "Grilling Supplies",
                        "Bread"];

// Function to dynamically create a recipe card
function makeRecipeCard(array_of_recipe_objects) {
    document.querySelector(".modal-container").style.display = "none";
    JSON_in_progress = false;
    
    // Stores any new recipes to local storage (speed up loading old recipes)
    addToStorage(array_of_recipe_objects);

    // Cycles through each recipe in the array
    for (let recipe_index = 0; recipe_index < array_of_recipe_objects.length; recipe_index++) {
        
        // Checks if there is an error in the local object and skips
        let recipe = array_of_recipe_objects[recipe_index];
        if (typeof(recipe.id) == "undefined") {
            continue;
        }

        // Creates a new container element for each recipe
        let recipe_div = document.createElement("div");
        recipe_div.setAttribute("data-id", recipe.id);
        recipe_div.setAttribute("class", "card");
        recipe_div.addEventListener("click", openDetailedRecipe, false);

        // Creates title bar for the card
        let title_head = document.createElement("div");
        title_head.setAttribute("class", "card_head");
        let title = document.createElement("h2");
        title.setAttribute("class", "card_title");
        title.textContent = recipe.title;
        title_head.append(title);
        recipe_div.append(title_head);

        // Adds the recipe image
        if (typeof(recipe.imageType) != "undefined") {
            let image = document.createElement("img");
            image.setAttribute("src", SpoonImageURL(recipe.id, recipe.imageType, "636x393", "recipeImages"));
            image.setAttribute("class", "card_image");
            image.setAttribute("alt", recipe.title);
            recipe_div.append(image);
        }

        // Adds the score as a X of 5 star rating
        recipe_div.append(makeStarDiv(recipe.spoonacularScore, recipe.id));

        // Adds the ready in X minutes
        let ready_time = document.createElement("div");
        ready_time.setAttribute("class", "ready_time");
        ready_time.textContent = `Time until ready: ${recipe.readyInMinutes} minutes`;
        recipe_div.append(ready_time);

        // Adds the recipe summary in html format
        let summary = document.createElement("p");
        summary.setAttribute("class", "recipe_summary");
        summary.innerHTML = trimHTMLString(recipe["summary"]);
        recipe_div.append(summary);

        // Adds the card to the page
        recipe_container.append(recipe_div);
    }
}

// Function to get shopping list
function getShoppingList() {
    // Reset page
    scroll(0,0);
    recipe_container.innerHTML = "";
    document.querySelector(".back-btn").style.display = "inline-block";



    // Gets the current favorite object
    let current_storage = JSON.parse(localStorage.getItem("shopping_list"));
    
    if (current_storage == null || current_storage.length == 0) {
        // Shows an overlay to the user that there is nothing in the shopping list, automatically disappears after 1.5 seconds
        document.querySelector("#modal-message").textContent = "No items in the shopping list";
        document.querySelector(".modal-container").style.display = "flex";
        setTimeout(function() {document.querySelector(".modal-container").style.display = "none";}, 1500);

        // Loads the main page as no items are in the shopping list
        loadFrontPage();
        return;
    }


    // Creates shopping  section
    let ingredient_section = document.createElement("section");
    ingredient_section.setAttribute("class", "shopping-list");

    // Creates header for the ingredient
    section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = "Shopping List:";
    section_head.append(title);

    // Adds a container for the remove item button
    let button_div = document.createElement("div");
    button_div.setAttribute("class", "button-div");

    // Adds a remove items button
    let button_shop = document.createElement("button");
    button_shop.setAttribute("id", "btn-remove-shop");
    button_shop.setAttribute("class", "btn-remove");
    button_shop.textContent = "Remove from shopping list";
    button_shop.addEventListener("click", removeFromShop, false);
    button_div.append(button_shop);

    section_head.append(button_div);
    ingredient_section.append(section_head);


    // Adds the ingredients
    current_storage.sort((a, b) => (a.aisle > b.aisle) ? 1 : -1);
    let current_aisle = "";
    let row_obj;
    for (let index = 0; index < current_storage.length; index++) {
        current_ingredient = current_storage[index];

        let new_li = document.createElement("li");
        new_li.setAttribute("class", "ingredient_item");
        new_li.setAttribute("data-id", current_ingredient.id);

        let input = document.createElement("input");
        input.setAttribute("class", "ingredient-input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", "");
        input.setAttribute("id", `ingredient-${current_ingredient.id}`);
        new_li.append(input);

        let measure_text = document.createElement("label");
        measure_text.setAttribute("class", "ingredient-label")
        measure_text.setAttribute("for", `ingredient-${current_ingredient.id}`);
        measure_text.textContent = ` ${current_ingredient.amount} ${current_ingredient.measure} ${current_ingredient.name}`;
        new_li.append(measure_text);

        if (current_aisle == current_ingredient.aisle) {
            // Add to current row
            row_obj.append(new_li);
        } else {
            // Make a new row
            if (current_aisle != "") {
                ingredient_section.append(row_obj);
            }
            current_aisle = current_ingredient.aisle;
            if (current_aisle == null) {
                current_aisle = "No aisle cataloged";
            }
            row_obj = document.createElement("ul");
            row_obj.setAttribute("class", "aisle");
            row_title = document.createElement("h3");
            row_title.setAttribute("class", "aisle-title");
            row_title.textContent = current_aisle;
            row_obj.append(row_title);
            row_obj.append(new_li);
        }
    }
    ingredient_section.append(row_obj);
    recipe_container.append(ingredient_section);
}

// Function to remove items from the shopping list
function removeFromShop() {
    let any_checked = false;
    let all_checkboxes = document.querySelectorAll(".ingredient-input");
    for (box = 0; box < all_checkboxes.length; box++) {
        if (all_checkboxes[box].checked) {
            any_checked = true;
        }
    }

    // If any or all are checked
    if (any_checked) {

        // Gets the current favorite object
        let current_storage = JSON.parse(localStorage.getItem("shopping_list"));
        if (current_storage != null) {
            // If there is an existing entry
            for (storage_index = current_storage.length - 1; storage_index >= 0; storage_index--) {
                if (document.querySelector(`#ingredient-${current_storage[storage_index].id}`).checked) {
                    current_storage.splice(storage_index, 1);
                }

            }
            // Converts the remaining object to a string and uploads to local storage
            var json_obj = JSON.stringify(current_storage);
            localStorage.setItem("shopping_list", json_obj);
        }

        // Reloads the shopping list with the remaining items
        getShoppingList();

    // Empty entire shopping list if nothing is checked
    } else {
        localStorage.removeItem("shopping_list");

        // Shows an overlay to the user that the shopping list is now empty, automatically disappears after 1.5 seconds
        document.querySelector("#modal-message").textContent = "All items deleted";
        document.querySelector(".modal-container").style.display = "flex";
        setTimeout(function() {document.querySelector(".modal-container").style.display = "none";}, 1500);

        // Loads the main page as no items remain in the shopping list
        loadFrontPage();
    }
    
    
}

// Function to get stars in a "p" element
function makeStarDiv(number, data_id) {
    // Calculates the number of stars to show based on the rating
    // Calculated out of 10 stars to get the half to show when reduced to only 5 (9 stars = 4.5)
    let num_of_stars = Math.round(parseInt(number) / 10);
    let decimal_num_stars = Math.round(parseInt(number) / 2) / 10;

    // Creates an element to hold all the star icons
    let star_container = document.createElement("p");
    star_container.setAttribute("class", "score");
    star_container.setAttribute("title", decimal_num_stars);

    // 5 count loop to create full, empty, or half star icon
    for (let star = 2; star <= 10; star += 2) {
        let star_img = document.createElement("i");
        star_img.setAttribute("aria-hidden", "true");
        if (star <= num_of_stars) {
            // Add full star
            star_img.setAttribute("class", "fas fa-star");
        } else if (star - 1 == num_of_stars ) {
            // Add half star
            star_img.setAttribute("class", "fas fa-star-half-alt");
        } else {
            // Add empty star
            star_img.setAttribute("class", "far fa-star");
        }
        star_container.append(star_img);
    }

    // Adds the favorite icon
    let favorite = document.createElement("i");

    // Checks if the recipe is currently a favorite
    if (isFavorite(data_id)) {
        favorite.setAttribute("class", "fas fa-heart card-favorite");
    } else {
        favorite.setAttribute("class", "fa fa-heart-o card-favorite");
    }

    // Stores recipe id and attaches an event handler to the icon
    favorite.setAttribute("data-id", data_id);
    favorite.addEventListener("click", favoriteClick, false)
    star_container.append(favorite);

    return star_container;
}

// Function which checks a string for closed HTML elements and trims the string
function trimHTMLString(string_input) {
    if (typeof(string_input) == "undefined") {
        return "";
    }
    const trim_length = 200;

    // If the string is already smaller than the max length
    if (string_input.length <= trim_length) {
        return string_input;
    }

    // Trims the string
    let trimmed_string = string_input.substring(0, trim_length).trim();

    // Checks if the last character was not a blank space, removes partial words
    if (trimmed_string.length == trim_length) {
        trimmed_string = completeWordsInString(trimmed_string);
    }

    // Function to remove a partial word as the last word in the summary
    function completeWordsInString (string_needing_fixed) {
        let reversed_needing_fix = string_needing_fixed.split("").reverse().join("");
        let last_space = reversed_needing_fix.indexOf(" ");
        if (last_space == -1 || last_space == 0) {
            return string_needing_fixed.trim();
        }
        return trimmed_string.substring(0, reversed_needing_fix.length - last_space).trim();
    }

    // Function to add a "..." to the end of the string to show there is more text available in the detailed section
    function addDotDotDot(final_string) {
        return `${final_string} ...`;
    }

    // Creates a string that is the reverse of the original, used to find last occurrences
    let reversed_string = trimmed_string.split("").reverse().join("");

    // If no HTML elements exist return shortened string
    if (reversed_string.indexOf("<") == -1) {
        return addDotDotDot(trimmed_string);

    // If there is a start element "<", but no finish ">"
    } else if (reversed_string.indexOf(">") == -1) {
        let index = reversed_string.length - reversed_string.indexOf("<");
        return addDotDotDot(trimmed_string.substring(0, index).trim());

    // If the start element "<" is after the last finish element ">"
    } else if (reversed_string.indexOf("<") < reversed_string.indexOf(">")) {
        let index = reversed_string.length - reversed_string.indexOf("<");
        return addDotDotDot(trimmed_string.substring(0, index).trim());
    }

    // Correct HTML syntax, return trimmed string
    // console.log(trimmed_string);
    return addDotDotDot(trimmed_string);
}

// Function to handle the click on a favorite icon on the recipe
function favoriteClick(event) {
    // Prevents opening up the recipe
    event.preventDefault();
    event.stopPropagation();

    // Checks if this is already a favorite
    if (this.classList.contains("fa-heart-o")) {
        this.classList.remove("fa", "fa-heart-o");
        this.classList.add("fas", "fa-heart");
        localFavorite(this.getAttribute("data-id"), "add");
    } else if (this.classList.contains("fa-heart")) {
        this.classList.remove("fas", "fa-heart");
        this.classList.add("fa", "fa-heart-o");
        localFavorite(this.getAttribute("data-id"), "remove");
    }

}

// Function to check if the recipe is a favorite
function isFavorite(recipe_id) {
    if (typeof(recipe_id) == "undefined") {
        return false;
    }

    // Checks within local storage for the recipe id
    let current_storage = JSON.parse(localStorage.getItem("favorite_list"));
    if (current_storage != null) {
        if (current_storage.includes(recipe_id.toString())) {
            return true;
        }
    }

    return false;
}

// Function to handle the favorite data in local storage
function localFavorite(recipe_id, method) {

    // Gets the current favorite object
    let current_storage = JSON.parse(localStorage.getItem("favorite_list"));

    // If the method is adding the recipe id to the favorite list
    if (method == "add") {            
        if (current_storage != null) {
            // If there is an existing entry, adds to this object
            if (current_storage.includes(recipe_id)) {
                    // Do nothing, already saved as a favorite
            } else {
                // Adds the recipe id to the list
                current_storage.push(recipe_id);            
            }
            // Array for saving to the local storage
            uploadOBJ = current_storage;
        } else {
            // If this is the first entry
            uploadOBJ = [recipe_id];
        }

    // If the method is removing the recipe from the favorite list
    } else if (method == "remove") {

        // If there are currently favorites in the storage
        if (current_storage != null) {
            // Checks if the recipe id exists in storage
            if (current_storage.includes(recipe_id)) {
                let recipe_index = current_storage.indexOf(recipe_id);
                current_storage.splice(recipe_index, 1);
                uploadOBJ = current_storage;
            } else {
                // Do nothing, the recipe ID is not in local storage
            }
        } else {
            // Do nothing, nothing saved in local storage
        }
    }

    // Converts the object to a string and uploads to local storage
    var json_obj = JSON.stringify(uploadOBJ);
    localStorage.setItem("favorite_list", json_obj);


}
// Function to load the contact page
function loadContact() {
    // Reset page
    scroll(0,0);
    recipe_container.innerHTML = "";

    // Creates header for the contact page
    let section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    let title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = "Contact";
    section_head.append(title);
    recipe_container.append(section_head);
    recipe_container.append(document.createElement("hr"));

    // Creates content div
    let contact_content = document.createElement("div");
    contact_content.setAttribute("class", "contact-content");

    // Creates a contact form
    let contact_form = document.createElement("form");
    contact_form.setAttribute("id", "contact-form");
    contact_form.setAttribute("action", "./php/email.php");

    // Creates a hidden enter button, prevents submit on enter
    let enter_btn = document.createElement("button");
    enter_btn.setAttribute("type", "submit");
    enter_btn.disabled = true;
    enter_btn.setAttribute("style", "display: none;");
    contact_form.append(enter_btn);

    // Creates the name input
    let name_label = document.createElement("label");
    name_label.setAttribute("class", "form-titles");
    name_label.setAttribute("for", "name");
    name_label.innerHTML = '<i class="fa fa-user" aria-hidden="true"></i> Name';
    contact_form.append(name_label);

    let name_input = document.createElement("input");
    name_input.setAttribute("class", "form-content");
    name_input.setAttribute("type", "text");
    name_input.setAttribute("id", "name");
    name_input.setAttribute("name", "name");
    name_input.setAttribute("value", "Your name");
    contact_form.append(name_input);    

    // Creates the email address input
    let email_label = document.createElement("label");
    email_label.setAttribute("class", "form-titles");
    email_label.setAttribute("for", "email");
    email_label.innerHTML = '<i class="fa fa-envelope" aria-hidden="true"></i> Email';
    contact_form.append(email_label);

    let email_input = document.createElement("input");
    email_input.setAttribute("class", "form-content");
    email_input.setAttribute("type", "email");
    email_input.setAttribute("id", "email");
    email_input.setAttribute("name", "email");
    email_input.setAttribute("value", "email@email.com");
    contact_form.append(email_input);    

    // Creates the emal content input
    let message_label = document.createElement("label");
    message_label.setAttribute("class", "form-titles");
    message_label.setAttribute("for", "message");
    message_label.innerHTML = '<i class="fa fa-rocket" aria-hidden="true"></i> Message';
    contact_form.append(message_label);

    let message_span = document.createElement("span");
    message_span.setAttribute("class", "resize");

    let message_input = document.createElement("input");
    message_input.setAttribute("class", "form-content message");
    message_input.setAttribute("type", "text");
    message_input.setAttribute("id", "message");
    message_input.setAttribute("name", "message");
    message_span.append(message_input);
    contact_form.append(message_span);
    contact_form.append(document.createElement("br"));
    
    let submit_btn = document.createElement("button");
    submit_btn.setAttribute("form", "contact-form");
    submit_btn.setAttribute("class", "submit-button");
    submit_btn.setAttribute("type", "submit");
    submit_btn.setAttribute("value", "Submit");
    submit_btn.textContent = "Submit";
    contact_form.append(submit_btn);

    contact_content.append(contact_form);


    //         <button form="contact-form" class="submit-button" type="submit" value="Submit">Submit</button>
    //         </form>

    recipe_container.append(contact_content);

}


// Function to load the main page
function loadFrontPage() {
    // Reset page
    scroll(0,0);
    recipe_container.innerHTML = "";
    document.querySelector(".back-btn").style.display = "none";


    // Adds event listeners to drop-down menu
    document.querySelector("#favorites-btn").addEventListener("click", favoritePage, false);
    document.querySelector("#favorites-icon").addEventListener("click", favoritePage, false);
    document.querySelector("#shopping-btn").addEventListener("click", getShoppingList, false);
    document.querySelector("#contact-btn").addEventListener("click", loadContact, false);



    // Test mode setup to minimize API calls while in development, loads once and then pulls from local storage on subsequent refreshes
    // let current_storage = JSON.parse(localStorage.getItem("recipe_list"));
    // if (current_storage == null) {
        JSON_in_progress = true;
        GetRandomRecipes(makeRecipeCard, {number: 100});
    // } else {
    //     let recipe_list = JSON.parse(localStorage.getItem("recipe_list"));
    //     makeRecipeCard(recipe_list);
    // }

}

// Shows an overlay to the user that the recipes are loading
document.querySelector("#modal-message").textContent = "Loading recipes";
document.querySelector(".modal-container").style.display = "flex";
loadFrontPage();

function favoritePage() {
    // Reset page
    scroll(0,0);
    recipe_container.innerHTML = "";
    document.querySelector(".back-btn").style.display = "inline-block";

    let favorite_list = JSON.parse(localStorage.getItem("favorite_list"));
    let current_storage = JSON.parse(localStorage.getItem("recipe_list"));
    if (favorite_list == null || favorite_list.length == 0) {
      // Shows an overlay to the user that there an no favorites, automatically disappears after 1.5 seconds
        document.querySelector("#modal-message").textContent = "No favorite recipes selected";
        document.querySelector(".modal-container").style.display = "flex";
        setTimeout(function() {document.querySelector(".modal-container").style.display = "none";}, 1500);
    } else {
        let favorite_object = [];
        for (let favorite_index = 0; favorite_index < favorite_list.length; favorite_index++) {
            let favorite_id = favorite_list[favorite_index];
            if (current_storage.filter(recipe => recipe.id == favorite_id).length > 0) {
                favorite_object.push(current_storage.filter(recipe => recipe.id == favorite_id)[0]);
            } else {
                JSON_in_progress = true;
                GetRecipeByIDs(makeRecipeCard, {ids: favorite_list.join(",")})
                return;
            }
        }
        makeRecipeCard(favorite_object);
    }
}

function openDetailedRecipe () {
    // Reset page
    scroll(0,0);
    document.querySelector(".back-btn").style.display = "inline-block";
    recipe_container.innerHTML = "";

    let click_id = this.getAttribute("data-id");
    let recipe_objs = all_recipe_object.filter(recipe => recipe.id == click_id);
    let recipe = recipe_objs[0];

    // Creates summary section
    let summary_section = document.createElement("section");
    summary_section.setAttribute("class", "recipe-summary");

    // Creates header for the recipe
    let section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    section_head.setAttribute("data-id", recipe.id);
    let title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = recipe.title;
    section_head.append(title);
    summary_section.append(section_head);

    // Adds the recipe image
    if (typeof(recipe.imageType) != "undefined") {
        let image = document.createElement("img");
        image.setAttribute("src", SpoonImageURL(recipe.id, recipe.imageType, "636x393", "recipeImages"));
        image.setAttribute("class", "recipe_image");
        image.setAttribute("alt", recipe.title);
        summary_section.append(image);
    }

    // Adds the score as a X of 5 star rating
    summary_section.append(makeStarDiv(recipe.spoonacularScore, recipe.id));

    // Adds the ready in X minutes
    let ready_time = document.createElement("div");
    ready_time.setAttribute("class", "ready_time");
    ready_time.textContent = `Time until ready: ${recipe.readyInMinutes} minutes`;
    summary_section.append(ready_time);

    summary_section.append(document.createElement("br"));

    // Adds the recipe summary in html format
    let summary = document.createElement("p");
    summary.setAttribute("class", "recipe_summary");
    summary.innerHTML = recipe["summary"];
    summary_section.append(summary);

    // Adds the summary section to the recipe page
    recipe_container.append(summary_section);


    // Creates ingredient section
    let ingredient_section = document.createElement("section");
    ingredient_section.setAttribute("class", "recipe-ingredients");

    // Creates header for the ingredient
    section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = "Ingredients:";
    section_head.append(title);

    // Adds a container for the shopping list, metric & US unit buttons
    let button_div = document.createElement("div");
    button_div.setAttribute("class", "button-div");

    // Adds a shopping list button
    let button_shop = document.createElement("button");
    button_shop.setAttribute("id", "btn-add-shop");
    button_shop.setAttribute("class", "btn-shop");
    button_shop.textContent = "Add to shopping list";
    button_shop.addEventListener("click", addToShop, false);
    button_div.append(button_shop);

    // Adds a US unit button
    let button_US = document.createElement("button");
    button_US.setAttribute("id", "btn-US");
    button_US.setAttribute("class", "btn-unit selected");
    button_US.textContent = "US";
    button_US.addEventListener("click", unitToggle, false);
    button_div.append(button_US);

    // Adds a metric unit button
    let button_metric = document.createElement("button");
    button_metric.setAttribute("id", "btn-metric");
    button_metric.setAttribute("class", "btn-unit");
    button_metric.textContent = "METRIC";
    button_metric.addEventListener("click", unitToggle, false);
    button_div.append(button_metric);

    section_head.append(button_div);
    ingredient_section.append(section_head);


    // Adds the ingredients
    let extended_ingredients = recipe.extendedIngredients;
    extended_ingredients.sort((a, b) => (a.aisle > b.aisle) ? 1 : -1);
    let current_aisle = "";
    let row_obj;
    for (let index = 0; index < extended_ingredients.length; index++) {
        current_ingredient = extended_ingredients[index];

        let new_li = document.createElement("li");
        new_li.setAttribute("class", "ingredient_item");
        new_li.setAttribute("data-id", current_ingredient.id);

        let input = document.createElement("input");
        input.setAttribute("class", "ingredient-input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", "");
        input.setAttribute("id", `ingredient-${current_ingredient.id}`);
        new_li.append(input);

        let US = current_ingredient.measures.us;
        let US_text = document.createElement("label");
        US_text.setAttribute("class", "US ingredient-label")
        US_text.setAttribute("for", `ingredient-${current_ingredient.id}`);
        US_text.textContent = ` ${US.amount} ${US.unitShort} ${current_ingredient.name}`;
        new_li.append(US_text);

        let metric = current_ingredient.measures.metric;
        let metric_text = document.createElement("label");
        metric_text.setAttribute("class", "metric ingredient-label")
        metric_text.setAttribute("for", `ingredient-${current_ingredient.id}`);
        metric_text.textContent = ` ${metric.amount} ${metric.unitShort} ${current_ingredient.name}`;
        new_li.append(metric_text);

        if (current_aisle == current_ingredient.aisle) {
            // Add to current row
            row_obj.append(new_li);
        } else {
            // Make a new row
            if (current_aisle != "") {
                ingredient_section.append(row_obj);
            }
            current_aisle = current_ingredient.aisle;
            row_obj = document.createElement("ul");
            row_obj.setAttribute("class", "aisle");
            row_title = document.createElement("h3");
            row_title.setAttribute("class", "aisle-title");
            row_title.textContent = current_aisle;
            row_obj.append(row_title);
            row_obj.append(new_li);
        }
    }
    ingredient_section.append(row_obj);
    recipe_container.append(ingredient_section);

    // Booleans incase there are no recipe instructions
    let text_instructions = false;
    let graphic_instructions = false;
    if (recipe.analyzedInstructions.length > 0) {
        graphic_instructions = true;
    }

    if (recipe.instructions != "") {
        text_instructions = true;
    }

    if (!text_instructions && !graphic_instructions) {
        // No instructions available
        return;
    }
    // Creates instructions section
    let instruction_section = document.createElement("section");
    instruction_section.setAttribute("class", "recipe-instructions");

    // Creates header for the ingredient
    section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = "Instructions:";
    section_head.append(title);

    // Creates a container for the instruction buttons
    button_div = document.createElement("div");
    button_div.setAttribute("class", "button-div");

    // Adds a button for the graphic only version of the instructions
    if (graphic_instructions) {
        let button_graphics = document.createElement("button");
        button_graphics.setAttribute("id", "btn-graphics");
        button_graphics.setAttribute("class", "btn-instructions selected");
        button_graphics.textContent = "Graphics";
        button_graphics.addEventListener("click", instructionToggle, false);
        button_div.append(button_graphics);
    }

    // Adds a button for the text only version of the instructions
    if (text_instructions) {
        let button_text = document.createElement("button");
        button_text.setAttribute("id", "btn-text");
        button_text.setAttribute("class", "btn-instructions ");
        button_text.textContent = "Text";
        button_text.addEventListener("click", instructionToggle, false);
        button_div.append(button_text);
    }

    section_head.append(button_div);
    instruction_section.append(section_head);

    // Adds the text only instructions to the page
    if (text_instructions) {
        let instruction_text = document.createElement("article");
        instruction_text.setAttribute("class", "instruction_text");
        instruction_text.innerHTML = recipe["instructions"];
        instruction_section.append(instruction_text);
    }

    // Adds the graphical instruction to the page
    if (graphic_instructions) {
        let detailed_instructions = recipe.analyzedInstructions[0].steps;
        let instruction_graphics = document.createElement("article");
        instruction_graphics.setAttribute("class", "instruction_graphics");

        // Cycles through each step in the recipe
        for (let step = 0; step < detailed_instructions.length; step++) {
            let step_obj = detailed_instructions[step];
            let step_id = document.createElement("div");
            step_id.setAttribute("class", "step");

            // Creates the step title
            let step_title = document.createElement("h3");
            step_title.setAttribute("class", "step-title");
            if (typeof(step_obj.length) != "undefined") {
                step_title.textContent = `Step ${step_obj.number}: ${step_obj.length.number} ${step_obj.length.unit}`;
            } else {
                step_title.textContent = `Step ${step_obj.number}`;
            }
            step_id.append(step_title);

            // Adds the step instructions
            let step_instruction = document.createElement("div");
            step_instruction.setAttribute("class", "step-instruction");
            step_instruction.textContent = step_obj.step;
            step_id.append(step_instruction);

            // Adds the ingredients used in the step
            if (step_obj.ingredients.length > 0) {
                let step_ingredient = document.createElement("div");
                step_ingredient.setAttribute("class", "step-figures");
                for (ingredient = 0; ingredient < step_obj.ingredients.length; ingredient++) {
                    if (step_obj.ingredients[ingredient].image != "") {
                        let ingredient_figure = document.createElement("figure");
                        ingredient_figure.setAttribute("class", "ingredient-figure");
                        ingredient_figure.setAttribute("data-id", step_obj.ingredients[ingredient].name);
                        ingredient_figure.addEventListener("click", getNutrition, false);

                        let ingredient_image = document.createElement("img");
                        ingredient_image.setAttribute("src", SpoonImageURL(step_obj.ingredients[ingredient].image, "", "100x100", "ingredients"));
                        ingredient_image.setAttribute("alt", step_obj.ingredients[ingredient].name);
                        ingredient_figure.append(ingredient_image);

                        let ingredient_caption = document.createElement("figcaption");
                        ingredient_caption.textContent = step_obj.ingredients[ingredient].name;
                        ingredient_figure.append(ingredient_caption);

                        step_ingredient.append(ingredient_figure);
                    }
                }
                step_id.append(step_ingredient);
            }

            // Adds the equipment used in the step
            if (step_obj.equipment.length > 0) {
                let step_equipment = document.createElement("div");
                step_equipment.setAttribute("class", "step-figures");
                for (equipment = 0; equipment < step_obj.equipment.length; equipment++) {
                    if (step_obj.equipment[equipment].image != "") {
                        let equipment_figure = document.createElement("figure");

                        let equipment_image = document.createElement("img");
                        equipment_image.setAttribute("src", SpoonImageURL(step_obj.equipment[equipment].image, "", "100x100", "equipment"));
                        equipment_image.setAttribute("alt", step_obj.equipment[equipment].name);
                        equipment_figure.append(equipment_image);

                        let equipment_caption = document.createElement("figcaption");
                        equipment_caption.textContent = step_obj.equipment[equipment].name;
                        equipment_figure.append(equipment_caption);

                        step_equipment.append(equipment_figure);
                    }
                }
                step_id.append(step_equipment);
            }
            instruction_graphics.append(step_id);
        }
        instruction_section.append(instruction_graphics);
    }
    recipe_container.append(instruction_section);
}

// Function to call nutrition api for the ingredient
function getNutrition() {
    GetNutritionix(loadNutrition, {query:this.getAttribute("data-id"), fields:nutritionix_fields});
}

// Function to load nutrition query results into the nutrition modal
function loadNutrition(result) {
    let nutrition_data = result.hits[0].fields;
    let object_keys = Object.keys(result.hits[0].fields);
    object_keys.forEach(element => {
        document.querySelector(`#${element}`).textContent = nutrition_data[element];
    });
    document.querySelector(".nutrition-modal-container").style.display = "flex";



}

// Adds some listeners to the setting button and close button
document.querySelector(".close").addEventListener("click", function () {document.querySelector(".nutrition-modal-container").style.display = "none";}, false);

// In case the user tries to click outside the modal to close
window.addEventListener("click", function(event) {
    if (event.target == document.querySelector(".nutrition-modal-container")) {
        document.querySelector(".nutrition-modal-container").style.display = "none";
    }
}, false)


// Function to add ingredients to shopping list
function addToShop () {
    // Gets the recipe id from the page
    let recipe_id = document.querySelector(".card-favorite").getAttribute("data-id");

    // Determines which unit is currently being displayed
    let unit_choice = "";
    if (document.querySelector("#btn-US").classList.contains("selected")) {
        unit_choice = "us";
    } else {
        unit_choice = "metric";
    }

    let any_checked = false;
    let all_checkboxes = document.querySelectorAll(".ingredient-input");
    for (box = 0; box < all_checkboxes.length; box++) {
        if (all_checkboxes[box].checked) {
            any_checked = true;
        }
    }

    let shopping_list = [];
    if (all_recipe_object.filter(recipe => recipe.id == recipe_id).length > 0) {
        let ingredients = all_recipe_object.filter(recipe => recipe.id == recipe_id)[0].extendedIngredients;
        for (ingredient_index = 0; ingredient_index < ingredients.length; ingredient_index++) {
            let ingredient = ingredients[ingredient_index];
            if (any_checked) {
                if (document.querySelector(`#ingredient-${ingredient.id}`).checked) {
                    let list_object = {
                        id: ingredient.id,
                        aisle: ingredient.aisle,
                        amount: ingredient.measures[unit_choice].amount,
                        measure: ingredient.measures[unit_choice].unitLong,
                        image: ingredient.image,
                        name: ingredient.name
                    }
                    shopping_list.push(list_object);
                }
            } else {

                let list_object = {
                    id: ingredient.id,
                    aisle: ingredient.aisle,
                    amount: ingredient.measures[unit_choice].amount,
                    measure: ingredient.measures[unit_choice].unitLong,
                    image: ingredient.image,
                    name: ingredient.name
                }
                shopping_list.push(list_object);
            }
        }

        // Gets the current shopping list from storage
        let current_storage = JSON.parse(localStorage.getItem("shopping_list"));
        
        if (current_storage != null) {
            // If there is an existing entry, adds to this object
            for (let ingredient_index = 0; ingredient_index < shopping_list.length; ingredient_index++) {
                // Checks if the grocery item is in local storage
                if (current_storage.filter(item => item.id == shopping_list[ingredient_index].id).length > 0) {
                    let missing_item = true;
                    for (list_index = 0; list_index < current_storage.length; list_index++) {
                        if (current_storage[list_index].id == shopping_list[ingredient_index].id) {
                            if (current_storage[list_index].measure == shopping_list[ingredient_index].measure) {
                                current_storage[list_index].amount = current_storage[list_index].amount + shopping_list[ingredient_index].amount;
                                missing_item = false;
                            }
                        }
                    }
                    if (missing_item) {
                        current_storage.push(shopping_list[ingredient_index]);
                    }
                } else {
                    current_storage.push(shopping_list[ingredient_index]);
                }
            }
            uploadOBJ = current_storage;
        } else {
            // If this is the first entry
            uploadOBJ = shopping_list;
        }

        // Converts the object to a string and uploads to local storage
        var json_obj = JSON.stringify(uploadOBJ);
        localStorage.setItem("shopping_list", json_obj);

    }
}

// Function to handle the unit button press
function unitToggle () {
    // Remove buttons focus
    document.activeElement.blur();

    let btn_id = this.getAttribute("id");
    if (this.classList.contains("selected")) {
        // Already selected, do nothing
        return;
    }


    let US_style = "none";
    let metric_style = "none";

    // Checks which button was pressed, and switches the selected to the one clicked on
    if (btn_id == "btn-metric") {
        document.querySelector("#btn-US").classList.remove("selected");
        metric_style = "block";
    } else {
        document.querySelector("#btn-metric").classList.remove("selected");
        US_style = "block";
    }

    // Shows/hide the metric ingredients on the page
    let metric_ingredients = document.querySelectorAll(".metric");
    for (let i = 0; i < metric_ingredients.length; i++) {
        metric_ingredients[i].style.display = metric_style;
    }

    // Shows/hide the US ingredients on the page
    let US_ingredients = document.querySelectorAll(".US");
    for (let i = 0; i < US_ingredients.length; i++) {
        US_ingredients[i].style.display = US_style;
    }

    this.classList.add("selected");
}

// Function to handle clicking on the instructions button
function instructionToggle () {
    // Remove buttons focus
    document.activeElement.blur();

    let btn_id = this.getAttribute("id");
    if (this.classList.contains("selected")) {
        // Already selected, do nothing
        return;
    }

    // Checks which button was pressed and updates accordingly
    if (btn_id == "btn-graphics") {
        document.querySelector("#btn-text").classList.remove("selected");
        document.querySelector(".instruction_text").style.display = "none";
        document.querySelector(".instruction_graphics").style.display = "block";
    } else {
        document.querySelector("#btn-graphics").classList.remove("selected");
        document.querySelector(".instruction_graphics").style.display = "none";
        document.querySelector(".instruction_text").style.display = "block";
    }
    this.classList.add("selected");
}

// Function to add recipes to local storage
function addToStorage (array_of_objects) {

    // Gets the current recipe list from storage
    let current_storage = JSON.parse(localStorage.getItem("recipe_list"));
    
    if (current_storage != null) {
        // If there is an existing entry, adds to this object
        for (let index = 0; index < array_of_objects.length; index++) {
            // Checks if the recipe ID is in local storage
            if (current_storage.filter(recipe => recipe.id == array_of_objects[index].id).length > 0) {
                // Do nothing
            } else {
                current_storage.push(array_of_objects[index]);
            }
        }
        uploadOBJ = current_storage;
    } else {
        // If this is the first entry
        uploadOBJ = array_of_objects;
    }

    // Delete items in array over 450, local storage limit
    let recipe_limit = 450;
    if (uploadOBJ.length > recipe_limit) {
        uploadOBJ.splice(0, uploadOBJ.length - recipe_limit);        
    }
    all_recipe_object = uploadOBJ;

    // Converts the object to a string and uploads to local storage
    var json_obj = JSON.stringify(uploadOBJ);
    localStorage.setItem("recipe_list", json_obj);
						   
}

function setUserSettings() {
    let user_intolerances = JSON.parse(localStorage.getItem("intolerances"));
    let user_restrictions = JSON.parse(localStorage.getItem("restrictions"));
    
    let dietary_intolerances = document.getElementsByClassName("intolerance");
    let dietary_restrictions = document.getElementsByClassName('restriction');
    if (user_intolerances != null ||  user_intolerances != undefined) {
        for (i = 0; i < dietary_intolerances.length; i++) {
            dietary_intolerances[i].childNodes[1].checked = user_intolerances[i];
        }
    }   
    if (user_restrictions != null ||  user_restrictions != undefined) {
        for (i = 0; i < dietary_restrictions.length; i++) {
            dietary_restrictions[i].childNodes[1].checked = user_restrictions[i];
        }
    }
}

setUserSettings();

function getUserSettings() {
    let dietary_intolerances = document.getElementsByClassName("intolerance");
    let dietary_restrictions = document.getElementsByClassName('restriction');
    
    if (dietary_intolerances != null ||  dietary_intolerances != undefined) {
        for (i = 0; i < dietary_intolerances.length; i++) {
            if (dietary_intolerances[i].childNodes[1].checked == true) {
                user_intolerances_names.push(dietary_intolerances[i].childNodes[5].innerHTML);
            }
        }
    }   
    if (dietary_restrictions != null ||  dietary_restrictions != undefined) {
        for (i = 0; i < dietary_restrictions.length; i++) {
            if (dietary_restrictions[i].childNodes[1].checked == true) {
                user_restrictions_names.push(dietary_restrictions[i].childNodes[5].innerHTML);
            }
        }
        user_i_string = user_intolerances_names.join(",");
        user_r_string = user_restrictions_names.join(",");
    }
    return user_i_string, user_r_string;
}

function filterResults(type) {
    let filter_recipes = document.querySelectorAll(".card");
    switch(type) {
        case "price":
            break;
        case "rating":
            for (i = 0; i < filter_recipes.length; i++) {
                let rId = filter_recipes[i].dataset.id;
                let rating = filter_recipes[i].children[2].title; 
                unsorted_array[i] = [rId, parseFloat(rating)];
            }
            let sorted_array = unsorted_array.sort(sortArray);
            function sortArray(a, b) {
                if (a[1] === b[1]) {
                    return 0;
                }
                else {
                    return (a[1] < b[1]) ? -1 : 1;
                }
            }   
            
            for (i = 0; i < sorted_array.length; i++) {
                groupIds.push(sorted_array[i][0]);
            }

            groupIds.reverse();
            let newids = groupIds.join(",");
            let recipe_container = document.querySelector("#recipe_container");
            recipe_container.textContent = '';        
            GetRecipeByIDs(makeRecipeCard, {ids: newids});
            break;
        case "time":
            break;
    }
}

function refineSearch() {
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: flex;");
    document.querySelector(".search-parameters").setAttribute("style", "display: none;");
}

function refineMainSearch() {
    document.querySelector(".search").setAttribute("style", "display: flex;");
    document.querySelector(".search-parameters").setAttribute("style", "display: none;");
}

function removeAddedIngredient(data) {
    let delete_ing = document.querySelector(".added-ingredients");
    let delete_ing_child = document.querySelector("#aIngredient-"+data.target.attributes[1].nodeValue);
    added_Ingredients.splice(data.target.attributes[1].nodeValue);
    delete_ing.removeChild(delete_ing_child);
}

function removeExcludedIngredient(data) {
    let delete_ing = document.querySelector(".excluded-ingredients");
    let delete_ing_child = document.querySelector("#eIngredient-"+data.target.attributes[1].nodeValue);
    excluded_Ingredients.splice(data.target.attributes[1].nodeValue);
    delete_ing.removeChild(delete_ing_child);

}

function addedIngredients(add) {
    let added_ingredients = document.querySelector(".added-ingredients");
    added_ingredients.textContent = '';
    added_Ingredients.push(add);
    for (i = 0; i < added_Ingredients.length; i++) {
        var li = document.createElement("p");
        li_b = document.createElement("button");
        li_b.setAttribute('class', 'remove-ai');
        li_b.setAttribute('id', i);
        li_b_text = document.createTextNode("x");
        var li_text = document.createTextNode(added_Ingredients[i]);
        li.appendChild(li_text);
        li_b.appendChild(li_b_text);
        li.appendChild(li_b);
        li.setAttribute('class', 'aIngredients')
        li.setAttribute('id', 'aIngredient-'+i);
        li.setAttribute('value', added_Ingredients[i]);
        var element = document.querySelector(".added-ingredients");
        element.appendChild(li);
        li_b.addEventListener("click", removeAddedIngredient);
    }
}

function excludedIngredients(exclude) {
    let excluded_ingredients = document.querySelector(".excluded-ingredients");
    excluded_ingredients.textContent = '';
    excluded_Ingredients.push(exclude);
    for (i = 0; i < excluded_Ingredients.length; i++) {
        var li = document.createElement("p");
        b = document.createElement("button");
        b.setAttribute('class', 'remove-ei');
        // b.className = "remove-ei"
        b.setAttribute('id', i);
        b_text = document.createTextNode("x");
        var li_text = document.createTextNode(excluded_Ingredients[i]);
        li.appendChild(li_text);
        b.appendChild(b_text);
        li.appendChild(b);
        li.setAttribute('class', 'eIngredients')
        li.setAttribute('id', 'eIngredient-'+i);
        li.setAttribute('value', excluded_Ingredients[i]);
        var element = document.querySelector(".excluded-ingredients");
        element.appendChild(li);
        b.addEventListener("click", removeExcludedIngredient);
    }
}

function displayComplexSearchParameters() {
    let search_parameters = document.querySelector(".search-parameters");
    if (search_parameters.querySelector(".search-results")) {
        let sp_child = document.querySelector(".search-results");
        let sp_button = document.querySelector(".refine-main-search");
        search_parameters.removeChild(sp_child);
        search_parameters.removeChild(sp_button);
    }
    // let add_ingredients = added_Ingredients.join(",");
    // let exx_ingredients = excluded_Ingredients.join(",");
    // console.log(add_ingredients);
    var keyword = document.querySelector("#search-recipe").value;
    var p = document.createElement("p");
    var b = document.createElement("button");
    p.setAttribute('class', 'search-results');
    b.setAttribute('class', 'refine-main-search');
    // p.className = "search-results";
    // b.className = "refine-main-search";
    b.onclick = refineMainSearch;
    var p_text = document.createTextNode("You searched for: " +  keyword);
    // if (keyword != "") {
    //     var p_text = document.createTextNode("Your searched for: " + keyword + ".");
    // }
    // if (added_Ingredients != "") {
    //     p_text.append("Included ingredients: " + added_Ingredients);
    // }
    // var p_text = document.createTextNode("Your searched for: " + keyword + ".Ingredients included:" + added_Ingredients + "");
    var b_text = document.createTextNode("Refine search");
    b.appendChild(b_text);
    p.appendChild(p_text);
    search_parameters.appendChild(p);
    search_parameters.appendChild(b);
    document.querySelector(".search").setAttribute("style", "display: none;");
    document.querySelector(".search-parameters").setAttribute("style", "display: flex;");
}

function displaySearchParameters() {
    let search_parameters = document.querySelector(".search-parameters");
    if (search_parameters.querySelector(".search-results")) {
        let sp_child = document.querySelector(".search-results");
        let sp_button = document.querySelector(".refine");
        search_parameters.removeChild(sp_child);
        search_parameters.removeChild(sp_button);
    }
    let add_ingredients = added_Ingredients.join(",");
    var p = document.createElement("p");
    var b = document.createElement("button");
    p.setAttribute('class', 'search-results');
    b.setAttribute('class', 'refine');
    // p.className = "search-results";
    // b.className = "refine";
    b.onclick = refineSearch;
    var p_text = document.createTextNode("You ingredients included: " + add_ingredients);
    var b_text = document.createTextNode("Refine search");
    b.appendChild(b_text);
    p.appendChild(p_text);
    search_parameters.appendChild(p);
    search_parameters.appendChild(b);
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: none;");
    document.querySelector(".search-parameters").setAttribute("style", "display: flex;");
}

function recipesIDs(ids) {
    // recipe_by_ingredients = JSON.parse(localStorage.getItem("recipe_list"));
    ids_array = [];
    for (i = 0; i < ids.length; i++) {
        ids_array.push(ids[i].id);
    }

    let ids_string = ids_array.join(",");
    ids_string = ids_string.toString();
    // console.log(ids_array);
    localStorage.removeItem("recipe_list");
    let recipe_container = document.querySelector("#recipe_container");
    recipe_container.textContent = '';
    localStorage.removeItem("recipe_list");
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 50});
    displaySearchParameters();
}

function complexRecipeIDs(ids) {
    // recipe_by_ingredients = JSON.parse(localStorage.getItem("recipe_list"));
    ids_array = [];
    for (i = 0; i < ids.length; i++) {
        ids_array.push(ids[i].id);
    }

    let ids_string = ids_array.join(",");
    ids_string = ids_string.toString();
    localStorage.removeItem("recipe_list");
    let recipe_container = document.querySelector("#recipe_container");
    recipe_container.textContent = '';
    localStorage.removeItem("recipe_list");
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 50});
    displayComplexSearchParameters();
}

function browseRecipeIDs(ids) {
    ids_array = [];
    for (i = 0; i < ids.length; i++) {
        ids_array.push(ids[i].id);
    }

    let ids_string = ids_array.join(",");
    ids_string = ids_string.toString();
    localStorage.removeItem("recipe_list");
    let recipe_container = document.querySelector("#recipe_container");
    recipe_container.textContent = '';
    localStorage.removeItem("recipe_list");
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 50});
}


document.querySelector(".search-ingredient").addEventListener("click", function() {
    document.querySelector(".search").setAttribute("style", "display: none;");
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: flex;");
});

document.querySelector(".add-ingredient-button").addEventListener("click", function() {
    var ingredient = document.querySelector("#sec-search-add-ingredient").value;
    var exingredient = document.querySelector("#sec-search-exclude-ingredient").value;
    // if ((ingredient == null || ingredient == undefined || ingredient == "") && (exingredient == null || exingredient == undefined || exingredient == "")) {
    //     // do nothing
    // } else if (ingredient == null || ingredient == undefined || ingredient == "") {
    //     excludedIngredients(exingredient);
    // } else if (exingredient == null || exingredient == undefined || exingredient == "") {
    //     addedIngredients(ingredient)
    // } else {
    //     excludedIngredients(exingredient);
    //     addedIngredients(ingredient)
    // }
    addedIngredients(ingredient);
});

document.querySelector(".exclude-ingredient-button").addEventListener("click", function() {
    var ingredient = document.querySelector("#sec-search-exclude-ingredient").value;
    excludedIngredients(ingredient);
});

document.querySelector("#exit-ingredient-search").addEventListener("click", function() {
    document.querySelector(".search").setAttribute("style", "display: flex;");
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: none;");
});

document.querySelector(".submit-ingredient-search").addEventListener("click", function() {
    var ingredientsList = added_Ingredients.join(",");
    var exc_ingredients = excluded_Ingredients.join(',');
    var key = document.querySelector("#sec-search-keyword").value;
    let intol, udiet = getUserSettings();
    let param = {"includeIngredients": ingredientsList, "excludedIngredients": exc_ingredients, "query": key, "intolerances": intol, "diet": udiet, "number":50};
    // let var1, var2 = getUserSettings();
    if ((ingredientsList == null || ingredientsList == undefined || ingredientsList == "")) {
        delete param.includeIngredients;
    } else {
        // do nothing
    }
    if ((intol == null || intol == undefined || intol == "")) {
        delete param.intol;
    } else {
        // do nothing
    }
    if ((udiet == null || udiet == undefined || udiet == "")) {
        delete param.udiet;
    } else {
        // do nothing
    }

    if (exc_ingredients == null || exc_ingredients == undefined || exc_ingredients == "") {
        delete param.excludedIngredients;
    } else {
        // do nothing
    }
    if (key == null || key == undefined || key == "") {
        delete param.query;
    } else {
        // do nothing
    }
    let var1, var2 = getUserSettings();
    
    // for (i = 0; i < param.length; i++) {
    //     jparam = jparam + param[i].includeIngredients; 
    // }
    // // jparam = param.join("}");
    // console.log(jparam);

    localStorage.removeItem("recipe_list")   
    GetRecipesComplex(recipesIDs, param);
    // }
    
});

document.querySelector(".sf-dropdown-content").addEventListener("click", function(data) {
    let filter_type = data.target.id;
    filterResults(filter_type);
});

document.querySelector(".search-recipe-button").addEventListener("click", function () {
    var keyword = document.querySelector("#search-recipe").value;
    if ((keyword == null || keyword == undefined || keyword == "")) {
        // do nothing
    } else {
        let recipe_container = document.querySelector("#recipe_container");
        recipe_container.textContent = '';   
        localStorage.removeItem("recipe_list");   
        GetRecipesComplex(complexRecipeIDs, {query: keyword, number:50});
    }
});

document.querySelector(".settings-save-button").addEventListener("click", function(data) {
    let dietary_intolerances = document.getElementsByClassName("intolerance");
    let dietary_restrictions = document.getElementsByClassName('restriction');
    for (i = 0; i < dietary_intolerances.length; i++) {
        let dietary_intolerance = dietary_intolerances[i].childNodes[1].checked;
        intolerances_array.push(dietary_intolerance);
    }

    for (i = 0; i < dietary_restrictions.length; i++) {
        let dietary_restriction = dietary_restrictions[i].childNodes[1].checked;
        restrictions_array.push(dietary_restriction);
    }

    var json_obj = JSON.stringify(intolerances_array);
    localStorage.setItem("intolerances", json_obj);

    var json_obj1 = JSON.stringify(intolerances_array);
    localStorage.setItem("restrictions", json_obj1);
});

document.querySelector("#meal-type").addEventListener("click", function(data) {
    let meal_type = data.target.innerHTML;
    GetRecipesComplex(browseRecipeIDs, {type: meal_type, number:50});
});

document.querySelector("#diets").addEventListener("click", function(data) {
    let diet = data.target.innerHTML;
    GetRecipesComplex(browseRecipeIDs, {diet: diet, number:50});
});

document.querySelector("#cuisines").addEventListener("click", function(data) {
    let cuisine = data.target.innerHTML;
    GetRecipesComplex(browseRecipeIDs, {cuisine: cuisine, number: 50});
});

document.querySelector("#others").addEventListener("click", function(data) {
    let other = data.target.id;
    var type;
    switch(other) {
        case 'time':
            type = "maxReadyTime:"+30;
            break;
        case "carbs":
            type = "maxCarbs:"+20;
            break;
        case "fat":
            type = "maxFat:"+20;
            break;
        case "calorie":
            type = "maxCalories:"+400;
            break;
        case "cholesterol":
            type = "maxCholesterol:"+30;
            break;
        case "sugar":
            type = "maxSugar:"+20;
            break;
        case "protein":
            type = "minProtein:"+50;
            break;
        case "calcium":
            type = "minCalcium:"+50;
            break;
        case "fiber":
            type = "minFiber:"+50;
            break;
    }
    GetRecipesComplex(complexRecipeIDs, {type, number:50});
});

document.querySelector("#user_settings").addEventListener("click", function() {
    setUserSettings();
    document.querySelector("#settings-modal").setAttribute("style", "display: flex;");
    document.querySelector("#recipe_container").setAttribute("style", "display: none;");
    document.querySelector(".search").setAttribute("style", "display: none;");
});

document.querySelector(".close-settings").addEventListener("click", function() {
    document.querySelector("#settings-modal").setAttribute("style", "display: none;");
    document.querySelector("#recipe_container").setAttribute("style", "display: flex;");
    document.querySelector(".search").setAttribute("style", "display: flex;");
});

document.querySelector(".navbar-brand").addEventListener("click", loadFrontPage, false);

window.addEventListener("scroll", function() {
    if (document.querySelector(".back-btn").style.display != "none") {
        return;
    }
    if (window.pageYOffset + window.innerHeight >= document.body.offsetHeight) {
      // Shows an overlay to the user that there an no favorites, automatically disappears after 1.5 seconds
        document.querySelector("#modal-message").textContent = "Loading more recipes";
        document.querySelector(".modal-container").style.display = "flex";
        setTimeout(function() {document.querySelector(".modal-container").style.display = "none";}, 1500);

        // Boolean to prevent making additional calls while the first one is in progress
        if (JSON_in_progress == false) {
            GetRandomRecipes(makeRecipeCard, {number: 100});
        }
    }



}, false);
