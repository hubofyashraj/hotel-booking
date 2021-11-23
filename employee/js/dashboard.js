setTimeout(()=>{
    $.ajax({
    url: '/employee',
    type: 'POST',
    dataType: 'json',
    success: [
        function (data){
            $('#user').text(data.name)
            // $('#user_id').text(data.id)
        }
    ],
    error: [
        function(xhr, status, error) {
            console.log(xhr.responseText)
            // location.href='/login'
        }
    ]
    })
} , 200)

