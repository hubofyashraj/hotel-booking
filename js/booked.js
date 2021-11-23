
const url = window.location.search;

const id = url.split('?id=')[1].split('&')[0]

console.log(id)

const data = JSON.stringify({
    id: id
})


$.ajax({
    url: '/hotel-booking/booked/booked-data',
    type: "GET",
    data: {data: data},
    dataType: "json",
    success: [
    function (result){
        const data = result;
        if(data.status===true){
            const booking = JSON.parse(atob(data.d1));
            const rooms = JSON.parse(atob(data.d2));
            const status = booking.status==='true'?'booked':'cancelled';
            if(booking.status==='false'){
                $('.submitbtn').css('display','none')
            }
            document.getElementById('booking_id').innerHTML=booking.booking_id;
            document.getElementById('status').innerHTML=status;
            document.getElementById('name').innerHTML=booking.user_name;
            document.getElementById('email').innerHTML=booking.email;
            document.getElementById('guestCount').innerHTML=booking.guests_count;
            document.getElementById('arrival').innerHTML=booking.arrival_datetime;
            document.getElementById('single').innerHTML=rooms.single;
            document.getElementById('double').innerHTML=rooms.double;
            document.getElementById('triple').innerHTML=rooms.triple;
            document.getElementById('quad').innerHTML=rooms.quad;
            document.getElementById('king').innerHTML=rooms.king;
        }else{
            location.href='/hotel-booking/index.html'
            alert('Invalid Booking ID');
        }

    }
    ]
})

function cancelBooking(){

    const booking_id = document.getElementById('booking_id').textContent;

    $.ajax({
        url: '/hotel-booking/cancel?id='+booking_id,
        type: 'GET',
        dataType: 'json',
        success: [
            function (result){
                const number = atob(result.contact);
                console.log(result,number)
                $('#number').text(number);
                $('.submitbtn').fadeOut(500);
                $('.cancel').fadeIn(500);
            }
        ]

    })
}


function cls(){
    $('.cancel').fadeOut(1000);
    $('.submitbtn').fadeIn(1000);
}

function cancelBookingConfirm(){
    const otp = $('#OTP').val();
    const id = $('#booking_id').text();
    console.log(otp,id)
    $.ajax({
        url: '/hotel-booking/cancel-conf',
        type: 'POST',
        data: {d1: btoa(otp), d2: btoa(id)},
        dataType: 'json',
        success: [
            function (result){
                if(result.status===true){
                    $('#msg').text(`Booking ${$('#booking_id').text()} Successfully Cancelled`)
                    $('.status').fadeIn(1000);
                    setTimeout(()=>{location.href='/'},5000)
                }else{
                    console.log(result)
                }
            }
        ]
    })
}