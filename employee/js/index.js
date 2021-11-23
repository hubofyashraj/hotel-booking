const login=document.getElementById('login')
login.addEventListener("click", e=>{
    e.preventDefault();


    const user = document.getElementById('userName').value;
    const pass = document.getElementById('password').value;

    if(user.length==0){
        $('#id_err').text('Field Can\'t Be Empty')
        if(pass.length==0){
            $('#pass_err').text('Field can\'t Be Empty')
        }else{
            $('#pass_err').text('')
        }
        return
    }else{
        $('#id_err').text('')
        if(pass.length==0){
            $('#pass_err').text('Field can\'t Be Empty')
            return
        }else{
            $('#pass_err').text('')
        }
    }

     const data = JSON.stringify({
         d1: btoa(user),
         d2: btoa(pass)
     })

    $.ajax({
        url: '/check',
        type: 'POST',
        data: {data: data},
        dataType: 'json',
        success: [
            function (result){
                if(result.status==='true'){
                    $('#id_err').text('');
                    $('#pass_err').text('');
                    document.body.removeChild($('.fd')[0]);
                    location.href='/dashboard'
                }else{
                    if(result.reason==='id'){
                        $('#id_err').text('Wrong User ID')
                    }else if(result.reason==='pass'){
                        $('#pass_err').text('Wrong Password')
                    }else{
                        $('#pass_err').text('Try Again!')
                    }
                }
            }
        ]
    })
})