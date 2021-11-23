


function fade(images) {

    let top = 2;

    let cur = images.length - 1;


    changeImage().then();

    async function changeImage(){
        const nextImage = (1 + cur) % images.length;

        images[cur].style.zIndex = top + 1;
        images[nextImage].style.zIndex = top;

        await transition();

        images[cur].style.zIndex = top;

        images[nextImage].style.zIndex = top + 1;

        top = top + 1;

        images[cur].style.opacity = 1;

        cur = nextImage;
    }

    function transition() {
        return new Promise(function(resolve) {
            var del = 0.05;

            const id = setInterval(changeOpacity, 10);

            function changeOpacity() {
                images[cur].style.opacity -= del;
                del -= del/25;
                if (images[cur].style.opacity <= 0) {
                    clearInterval(id);
                    resolve();
                }
            }

        })
    }
}

function book(){
    fade(document.getElementsByClassName('book-img'))
    location.href="/hotel-booking/reception.html"
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

function cancelBooking(){
    $('.search').fadeIn(1000);
}

function searchBooking(){
    const id = $('#booking_id').val();
    if (id.length===0){
        alert('Enter Booking ID')
        return
    }

    $.ajax({
        url:`/hotel-booking/booked?id=${id}`,
        type:'GET',
        dataType:'json',
        success: [
            function (result){
                console.log(result);
                if(result.status === true){
                    location.href=`/hotel-booking/booked?id=${id}&redir=${true}`
                }else{
                    alert('Invalid Booking ID');
                }

            }
        ]
    })

}

function previousPic(){
    $('.arrow-container').css('visibility','hidden')
    var area = document.getElementById('room-gallery')
    var width = area.offsetWidth+20;
    var prevPic = area.scrollLeft-width;

    function scroll(){
        if(area.scrollLeft === prevPic || area.scrollLeft === 0){
            $('.arrow-container').css('visibility','visible')
            return
        }
        area.scrollTo(area.scrollLeft-1,0)
        setTimeout(()=>{scroll()},1)
    }
    scroll()
}


function nextPic(){
    $('.arrow-container').css('visibility','hidden')
    var area = document.getElementById('room-gallery')
    var width = $('.images').width()+20;
    console.log(width,document.getElementById('room-gallery').offsetWidth)
    var nextPic = area.scrollLeft+width;
    var limit = area.scrollWidth;

    function scroll(){
        if(area.scrollLeft === nextPic || nextPic >= limit){
            $('.arrow-container').css('visibility','visible')
            return
        }
        area.scrollTo(area.scrollLeft+1,0)
        setTimeout(()=>{scroll()},1)
    }
    scroll()

}


function showRooms(){
    const container = $('.image-container');
    const img = $('#caret-img');
    if (container.css('display') === 'none')
    {
        setTimeout(() => {$('.image-container').fadeIn(); $('.room-selectors').fadeIn()}, 100)
        img.css('transform', 'rotateZ(0deg)');
        addImages('single');
    } else {
        setTimeout(() => {$('.image-container').fadeOut(); $('.room-selectors').fadeOut()}, 100)
        img.css('transform', 'rotateZ(180deg)');
    }
}



function addImages(directory){
    $('.room-name > h3').css('color','rgba(133,100,53,0.73)')

    document.getElementById(directory).style.color='rgba(239,217,150,0.58)'
    var container = document.getElementById('room-gallery');
    while (container.firstChild){
        container.removeChild(container.firstChild)
    }
    var i=1;

    function add(){
        var a = document.createElement('div')
        a.setAttribute('class', 'row-auto images')

        var b = new Image();
        b.onload = ()=>{
            a.appendChild(b);
            container.appendChild(a);
            i++;
            add();
        }
        b.onerror = ()=>{console.log(i); }
        b.src='/images/rooms/' + directory + '/' + i + '.webp'
    }
    add()
}