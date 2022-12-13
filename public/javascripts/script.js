function addToCart(proId) {
    $.ajax({
        url : '/add-to-cart/' + proId,
        method : 'get',
        success : (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $('#cart-count').html(count)
            }
        }
    })
}




$('#order-status').on('change', function () {
    var orderId = $("#orderId").val();
    var orderStatus = $("#order-status").val();

    $.ajax({
        url: '/admin/change-order-status',
        data: {
            orderId: orderId,
            orderStatus: orderStatus
        },
        method: 'post',
        dataType: 'json',
        success: (response) => {
            $("#order-status").bind('<option value=' + response + '>' + response + '</option>');
            if (response.currentOrderStatus == 'Confirmed') {
                toastr.info('Order status changed to ' + response.currentOrderStatus)
            } else if (response.currentOrderStatus == 'Shipped') {
                toastr.warning('Order status changed to ' + response.currentOrderStatus)
            } else if (response.currentOrderStatus == 'Out for delivery') {
                toastr.info('Order status changed to ' + response.currentOrderStatus)
            } else {
                toastr.success('Order status changed to ' + response.currentOrderStatus)
            }
        }
    })


});