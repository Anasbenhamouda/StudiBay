var basket = [];

function renderProducts(parentNode, products) {
    console.log('rendering products');

    if (products.length == 0) {
        console.log("no products received");
        $(parentNode).append('<tr><td colspan="6" class="missingData">Keine Produkte vorhanden</td></tr>');
    } else {
        console.log("rendering " + products.length + " products");

        $(products).each(function(idx, item) {
            var node = $('<tr>');

            //node.append($('<td>').text(idx + 1));
            //node.append($('<td>').text(item.id));
            node.append($('<td class="bildColone">').html('<img src="http://localhost:8000/' + item.bilder[0].bildpfad + '" style="width:70%">'));
            //console.log("*************" + item.bilder[0].bildpfad);
            node.append($('<td class="nameColone">').text(item.bezeichnung));
            node.append($('<td>').text(item.beschreibung));
            node.append($('<td class="preisColone">').text(formatToEuro(item.bruttopreis)));
            node.append(
                $('<td class="btnColone">')
                .append($('<button class="btn btn-primary">')
                    .attr('type', 'button')
                    .attr('onClick', 'addToBasket(' + item.id + ')')
                    .text('In den Einkaufswagen')
                )
            );

            $(parentNode).append(node);
        });
    }
}

function formatToEuro(val) {
    if (val === null || val === undefined)
        val = 0.0;
    var asString = val.toFixed(2).toString();
    return asString.replace('.', ',') + " €";
}

function jumpToDetails(id) {
    location.href = 'shopDetails.html?id=' + id;
}

function addToBasket(id) {

    // load record from api by id
    $.ajax({
        url: 'http://localhost:8000/api/produkt/gib/' + id,
        method: 'get',
        contentType: 'application/json; charset=utf-8',
        cache: false,
        dataType: 'json'
    }).done(function(response) {
        var productToAdd = response;
        console.log('trying to add to basket, product id=' + productToAdd.id);

        // get basket data from session
        if (existsSessionItem('shoppingBasket'))
            basket = getJSONSessionItem('shoppingBasket');

        // check if product in basket
        var posInBasket = -1;
        for (i = 0; i < basket.length; i++) {
            if (basket[i].product.id == productToAdd.id) {
                posInBasket = i;
                break;
            }
        }

        // if not, add it or otherwise just increase amount
        if (posInBasket == -1) {
            console.log('product not in basket, creating new position');
            basket.push({
                product: productToAdd,
                amount: 1
            });
        } else {
            console.log('product found in basket, increasing amount');
            basket[posInBasket].amount++;
        }

        // remember changes in localStorage
        setJSONSessionItem('shoppingBasket', basket);

        // inform user
        alert('Produkt ' + productToAdd.bezeichnung + ' wurde zum Warenkorb hinzugefügt');

    }).fail(function(jqXHR, statusText, error) {
        console.log('Response Code: ' + jqXHR.status + ' - Fehlermeldung: ' + jqXHR.responseText);
        alert('Ein Fehler ist aufgetreten');
    });
}

function renderBasket(parentNode) {
    // get basket data from session
    if (existsSessionItem('shoppingBasket'))
        basket = getJSONSessionItem('shoppingBasket');

    // empty parentNode
    $(parentNode).empty();

    // show message if no basket positions
    if (basket.length == 0) {
        console.log("no positions in basket");
        $(parentNode).append('<tr><td colspan="6" class="missingData">Der Warenkorb ist leer</td></tr>');
    } else {
        var sum = 0.0;
        var tax = 0.0;
        var totalTax = 0.0;
        var totalSum = 0.0;

        $(basket).each(function(idx, item) {
            // calc position sum
            sum = item.product.bruttopreis * item.amount;

            // containing tax
            tax = item.product.mehrwertsteueranteil * item.amount;

            // add up totals
            totalTax += tax;
            totalSum += sum;

            // create node
            var node = $('<tr>');

            node.append($('<td>').text(idx + 1));
            node.append($('<td>').text(item.product.bezeichnung));
            node.append($('<td>').text(formatToEuro(item.product.bruttopreis)));
            node.append($('<td>').text(item.amount));
            node.append($('<td>').text(formatToEuro(sum)));
            node.append(
                $('<td>')
                .append($('<button class="btn btn-primary">')
                    .attr('type', 'button')
                    .attr('onClick', 'removeBasketPosition(' + idx + ')')
                    .text('Entfernen')
                )
            );

            // output node
            $(parentNode).append(node);
        });

        $(parentNode)
            .append('<tr><td colspan="6">&nbsp;</td></tr>')
            .append('<tr><td colspan="4" class="rightBold">Gesamtsumme: </td><td class="bold">' + formatToEuro(totalSum) + '</td></tr>')
            .append('<tr><td colspan="4" class="rightBold">enth. MwSt.: </td><td class="bold">' + formatToEuro(totalTax) + '</td></tr>')
            .append('<tr><td colspan="6">&nbsp;</td></tr>');
    }
}

function removeBasketPosition(idx) {
    console.log('removing basket position at idx=' + idx);

    // remove position at idx or empty basket completely
    if (basket.length > 1) {
        // remove position at idx
        basket.splice(idx, 1);

        // remember changes in localStorage
        setJSONSessionItem('shoppingBasket', basket);
    } else {
        // clear local variable
        basket = [];
        // clear session variable
        removeSessionItem('shoppingBasket');
    }

    // redraw basket
    renderBasket('#basket > tbody');
}

function emptyBasket() {
    console.log('emptying basket');

    // clear local variable
    basket = [];

    // clear session variable
    removeSessionItem('shoppingBasket');

    // redraw basket
    renderBasket('#basket > tbody');
}