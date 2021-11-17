var intervalId = setInterval(fader,1000)

function fader(){
    $('.feather-pen').fadeOut().fadeIn();
}


function openForm(){
    clearInterval(intervalId)
    $('.feather-pen').fadeOut()
    var form = document.getElementById('form-back');

    form.style.top="-50%"
    var top = form.style.top;


    var interval = setInterval(comedown,50);

    function comedown(){
        top = parseInt(top.split('%')[0])+10+"%"
        form.style.top = top;


        if(top === "50%")
            clearInterval(interval);

    }


}

// var ins = document.getElementsByClassName('room');
// Array.from(ins).forEach(
//     async function (inp) {
//         inp.onkeypress=()=>{
//             if(inp.value.length===0){
//                 console.log('zero')
//             }
//         }
//     }
// )

var user = {};

function checkFields(){
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var contact = document.getElementById('contact').value;
    var guestCount = document.getElementById('guestCount').value;
    var arrival = document.getElementById('arrival').value;


    if (name.length > 0 && email.length > 0 && contact.length > 0 && guestCount.length > 0 && arrival.length > 0){
        if (guestCount<1){
            alert('Invalid Number of Guests!');
            return
        }

        const r = new RegExp('[a-zA-Z0-9\.\_]+@[a-zA-Z0-9\.\_]+[\.][a-z]+')
        if(r.exec(email)==null){
            alert('Invalid Email Address!');
            return;
        }
        if(r.exec(email)[0]!==email){
            alert('Invalid Email Address!');
            return;
        }

        const cr = new RegExp('[0-9][0-9][0-9][0-9][0-9]+')
        if(cr.exec(contact)==null){
            alert('Invalid Contact Number!');
            return;
        }
        if(cr.exec(contact)[0]!==contact){
            alert('Invalid Contact Number!');
            return;
        }
        user = {
            name: name,
            email: email,
            contact: contact,
            guestCount:guestCount,
            arrival: arrival,
        }
        next()
    }else {
        alert('Please fill all details')
    }



    function next(){
        var form = document.getElementById('form-back');
        var nextForm = document.getElementById('rooms-selection');

        form.style.top="50%"
        nextForm.style.bottom="-50%"
        var top = form.style.top;
        var bottom = nextForm.style.bottom;

        var interval = setInterval(goUp,50);


        function goUp(){
            top = parseInt(top.split('%')[0])-10+"%"
            bottom = parseInt(bottom.split('%')[0])+10+"%"
            form.style.top = top;
            nextForm.style.bottom = bottom;

            if(top === "-50%" || bottom ==="50%")
                clearInterval(interval);

        }
    }

}


function checkAvailability(){
    fade(document.getElementsByClassName('check-img'))
    $.ajax({
        url: '/hotel-booking/available',
        type: 'GET',
        dataType: 'json',
        success: [
            function (result){
                $('.availability').fadeIn(1000);
                $('#availableSingle').text(result.single);
                $('#availableDouble').text(result.double);
                $('#availableTriple').text(result.triple);
                $('#availableQuad').text(result.quad);
                $('#availableKing').text(result.king);
            }
        ]
    })
}

function test(){
    const counts = document.getElementsByClassName('room');

    for(const child of counts) {
        if(child.value.length===0){
            child.value=0
        }
    }
    setTimeout(()=>{proceed()},200);
}

function proceed(){
    const counts = document.getElementsByClassName('room');

    if(counts[0].value*2 + counts[1].value*4 + counts[2].value*6 + counts[3].value*8 + counts[4].value*2 < user.guestCount){
        alert('more room required for '+user.guestCount+' guests')
        return
    }

    var rooms = {
        single:counts[0].value,
        double:counts[1].value,
        triple:counts[2].value,
        quad:counts[3].value,
        king:counts[4].value,
    }


    var data = JSON.stringify({
        userData: btoa(JSON.stringify(user)),
        roomData: btoa(JSON.stringify(rooms)),
    })


    function submit(){
        $.ajax({
            url: "/hotel-booking/reception.html/booked",
            type: "POST",
            data: {data: data},
            dataType: "json",
            success: [
                function(result){
                    console.log(result)
                    if(result.status === true){
                        const booking_id = result.booking_id;
                        $.ajax({
                            url:`/hotel-booking/booked?id=${booking_id}`,
                            type:'GET',
                            dataType:'json',
                            success: [
                                function (result){
                                    console.log(result);
                                    if(result.status === true){
                                        location.href=`/hotel-booking/booked?id=${booking_id}&redir=${true}`
                                    }else{
                                        alert('Invalid Booking ID');
                                    }
                                }
                            ]
                        })
                    }else{
                        if(result.reason==='Rooms Not Available'){
                            var available = atob(result.data);
                            console.log(available)
                            $('.availability').fadeIn(1000);
                            $('#availableSingle').text(available.single);
                            $('#availableDouble').text(available.double);
                            $('#availableTriple').text(available.triple);
                            $('#availableQuad').text(available.quad);
                            $('#availableKing').text(available.king);
                        }else if(result.reason==='Invalid Room Configuration'){
                            alert('Please Select Correct Rooms Configuration')
                        }else{
                            alert('Please Try Again')
                        }
                    }
                }
            ]
        })
    }

    setTimeout(()=>{submit()},500)

}
