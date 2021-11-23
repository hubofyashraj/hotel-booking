setTimeout(()=>{
    $.ajax({
    url: '/employee',
    type: 'POST',
    dataType: 'json',
    success: [
        function (data){
            $('#user').text(data.name)
            // $('#user_id').text(data.id)

            $.ajax({
                url: '/getBookings',
                type: 'GET',
                dataType: 'json',
                success: [
                    function (data){
                    console.log(data)
                    const count = data.total;
                    const bookings = data.bookings
                    var table = document.getElementById('bookings')
                        for( var i=0;i<count;i++){
                        const booking = (bookings[i]);

                        if(booking.arrival_datetime.split('T')[0]!=(new Date().getFullYear()+'-'+new Date().getMonth()+'-'+new Date().getDate())){
                            continue;
                        }

                        var row = document.createElement('tr');
                        var id = document.createElement('th');
                        id.setAttribute('scope', 'row');
                        id.innerText=booking.booking_id;
                        row.appendChild(id);
                        var name = document.createElement('td');
                        name.innerText=booking.user_name;
                        row.appendChild(name);
                        var arrival = document.createElement('td');
                        arrival.innerText=(booking.arrival_datetime).replace('T',' ').split(':00.')[0];
                        row.appendChild(arrival);
                        var btnd = document.createElement('td');
                        var btn = document.createElement('button');
                        btn.innerText='CLICK';
                        btn.setAttribute('class','btn');

                        btn.onclick=()=>{
                            click(booking.booking_id);
                        }

                        btnd.appendChild(btn);
                        row.appendChild(btnd);

                        table.appendChild(row);
                    }
                    }
                ]
            })
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

function click(id){
    alert(id);
}