     if(localStorage.getItem("keeper")==null || localStorage.getItem("")){
      $('#age-gate').show();      
     }   
      $('#enter').click(function(){
       var day = $('#day').val();
       var month = $('#month').val();
       var year = $('#year').val();
       


      if(day=="0" || month=="0"  || year=="0" ){
      $('#notify').text("Your birth date is required!");
       return false;
       }

       var d = new Date();
       var jyear = d.getFullYear();
       var jmonth = d.getMonth();
       jmonth = jmonth + 1;
       //var xage =jyear - year;
       //var xmon = jmonth - month;
       var cage = jmonth +"/01/"+ jyear;
       var cmon = month +"/01/"+ year;
       var cur_datev = new Date(cage);
       var given_agev = new Date(cmon);
       var cur_date = cur_datev.getTime(); 
       var given_age = given_agev.getTime();
       var std_age = cur_date - given_age;
       var ageaccess =  std_age/31536000000;

      if(ageaccess >= 18){
      var object = {value: "value", timestamp: new Date().getTime()}
      localStorage.setItem("keeper", JSON.stringify(object));

      //compareTime(dateString, now); //to implement

      $('#notify').html('<span style="color:green">Access allowed!</span>');     
      setTimeout(function(){ 
      $('#age-gate').fadeOut();     
          },2000);
      }else{
         $('#notify').text("Access denied! You are not up to the legal drinking age!"); 
      }

       });
       
        if(localStorage.getItem("keeper") !=null){
        var object = JSON.parse(localStorage.getItem("keeper")),
        dateString = object.timestamp,
        now = new Date().getTime().toString();
        var theday = now - dateString;
          theday = theday/86400000;
         if(theday>1){
       localStorage.clear();
       }
       $('#age-gate').hide();    
        }   
       