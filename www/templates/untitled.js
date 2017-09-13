
.controller("StoreCategoryCtrl",function($rootScope,$scope,$http,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading){
     

    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/BusinessTypeList";
    $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.business_type_data="";


   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.loading=true;


   $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
  
  $scope.chunk = function (arr, size) {
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
      newArr.push(arr.slice(i, i+size));
    }
    return newArr;
  }

  $scope.setCategory=function(selectedCategory){
    localStorage.setItem("selectedCategory",selectedCategory);
     $location.path("/app/near-by-store-map").replace();
  }

   $scope.loadStoreCategory=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                $scope.business_type_data = $scope.chunk(d ,3)
                //console.log(data);
                $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }
  $scope.loadStoreCategory();



})

.controller("NearByStoreMapCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading,StoreData,$compile,$ionicModal){
   
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.getItem("selectedCategory");
    
    //alert($scope.selected_category);
    $scope.base_url=BaseUrl;
    $scope.store_list_url = $scope.base_url+"api/Store/List";
     $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.store_data=StoreData.getProperty();
    $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
    $scope.lat="";
    $scope.lng="";

 
//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=false;
    $scope.loading=true;

   $scope.getCurrentPosition=function()
   {
        $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       var options = {timeout: 10000, enableHighAccuracy: true};
         $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        
               var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              
               $scope.lat=position.coords.latitude;
               $scope.lng=position.coords.longitude;
               localStorage.setItem("lastLat",$scope.lat);
               localStorage.setItem("lastLng",$scope.lng);
                $scope.loadStoreData(position.coords.latitude,position.coords.longitude);
       
        }, function(error){
               console.log("Could not get location");
               console.log(error);
               $scope.getAlternateCurrentPosition();
        });
   };
   $scope.getAlternateCurrentPosition = function(){
       var latLong;
        $http({
            url:  "http://ipinfo.io",
            method: "GET"
        }).success(function (data, status, headers, config){
            console.log("Found location ["+data.loc+"] by ipinfo.io");
            latLong = data.loc.split(",");
           $scope.lat=latLong[0];
           $scope.lng=latLong[1];
           localStorage.setItem("lastLat",$scope.lat);
           localStorage.setItem("lastLng",$scope.lng);
            $scope.loadStoreData( $scope.lat, $scope.lng);

        }).error(function (data, status, headers, config) {
             console.log(error);
            }).finally(function () {
          $scope.loading = false;
        });


     };
   $scope.getCurrentPosition();

  $scope.getMarkerIcon=function(storeCategory)
  {
    var markerImageUrl=[
                       "custom/images/map-icon/blue.png",
                       "custom/images/map-icon/orange.png",
                       "custom/images/map-icon/green.png",
                       "custom/images/map-icon/pink.png"
                       ];
    var markerImage="";                   

    if(storeCategory=="1" || storeCategory==1) //Spa       
               markerImage=markerImageUrl[0];
    else  if(storeCategory=="2" || storeCategory==2) // Restaurants     
               markerImage=markerImageUrl[1];
    else  if(storeCategory=="3" || storeCategory==3) //     Grocery 
               markerImage=markerImageUrl[2];        
    else  if(storeCategory=="4" || storeCategory==4) // Shopping     
               markerImage=markerImageUrl[3];
    else  markerImage=markerImageUrl[3];      
    
    return  markerImage;           
  }

  $scope.loadMap = function(lat,lng){

    
     // var options = {timeout: 10000, enableHighAccuracy: true};
      var latLng = new google.maps.LatLng(lat, lng);
 
      var mapOptions = {
        center: latLng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
     var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      $scope.store_data=StoreData.getProperty();
      var markers = [];
       



      if($scope.store_data.length>0)
               {
               // alert($scope.store_data.length);
                    for(i=0;i<$scope.store_data.length;i++)
                 {
                       markers.push(
                      $scope.createMarker($scope.store_data[i].Lat,
                   $scope.store_data[i].Lon,
                    $scope.store_data[i].Name,
                    $scope.store_data[i].CashBack,
                    $scope.store_data[i].Distance,
                    $scope.store_data[i].Phone,
                    $scope.getMarkerIcon($scope.store_data[i].Business),
                    $scope.store_data[i].Id)
                      );  
                } // for

                 var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'custom/images/m'});
               }

   $scope.map = map;


   
     
  }
  
  $scope.setSelectedStoreAndRoute=function(current_store_id)
  {
     localStorage.setItem("selectedStoreId",current_store_id);
     $location.path("/app/store-option").replace();
    
  }

 $scope.createMarker=  function(lat, lng, name,cashBack,distance,phone,image_url,current_store_id)
{



    var htmL="<div class='i-window' ng-click='setSelectedStoreAndRoute("+current_store_id+")'  >"+
                            "<div >"+
                                "<span id=\"name\">"+ name+"</span>"+
                            "</div>"+
                            "<div >"+
                                "<span> Cash back: </span> "+
                                "<span style='font-weight:bold;'>"+ cashBack +"% </span>"+
                            "</div>"+
                            "<div>"+
                                 "<span> Discount value: </span>"+
                                 "<span style='font-weight:bold;'>"+ "7.1" +" </span>"+
                            "</div>"+
                            "<div>"+
                                "<span> Loyality program: </span>"+
                                "<span style='font-weight:bold;'>"+ "Yes" +" </span>"+
                            "</div>"+
                             "<div class=\"text-center\" >"+
                                "<img class='map-marker-image' src='"+image_url+"'>"+
                            "</div>"+
                        "</div>";                  
   var compiledContent = $compile(htmL)($scope);

  var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            icon: "custom/images/map-icon/map-marker-trans.png"
        });
   
   var infoWindow = new google.maps.InfoWindow();
       infoWindow.setContent(compiledContent[0]);
       infoWindow.open($scope.map, marker); 
   
    return marker;

}

   $scope.loadStoreData=function(lat,lng){

         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        
         $scope.selected_category=localStorage.getItem("selectedCategory");
        
         
        var url = $scope.store_list_url +  "?";
        if($location.search().referer && $location.search().referer=="cs")
        {
           var search_url = localStorage.getItem("search_url");
           if(search_url)
           {
             // http://admin.cashpointsbank.com/api/Store/List?level=0&itemList=true&employeeList=true&dealList=true&searchby=3&city=Ho%20Chi%20Minh%20City&state=VN&country=VN&isAdvancedSearch=true&type=1
              url = url+"level=0&itemList=true&employeeList=true&dealList=true";
              url = url+search_url;
           }
        }
        else
       {

          url = url+"lat=" + lat + "&lon=" + lng + "&limit=50&searchby=1&mileage=5&itemList=true&employeeList=true&dealList=true";
       }
        if ($scope.selected_category != null && $scope.selected_category != undefined && $scope.selected_category!=''){
            url += "&type=" +$scope.selected_category;
        }
          var myJsonRequest = new Object();
              myJsonRequest.lat =lat;
              myJsonRequest.lng  =lng;  
              myJsonRequest.limit  =50;  
              myJsonRequest.searchby  =1;  
              myJsonRequest.mileage  =5;  
              myJsonRequest.itemList  =true;  
              myJsonRequest.employeeList  =true;  
              myJsonRequest.dealList  =true;  
              if($scope.selected_category != null && $scope.selected_category != undefined && $scope.selected_category!=''){
                 myJsonRequest.type  = $scope.selected_category;
              }

            $http({
                url:  url,
                method: "GET",
                  headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
            }).success(function (data, status, headers, config){
                if(data.Success)
                 {
                     $scope.store_data=StoreData.setProperty(data.StoreData);
                     $scope.loadMap(lat,lng);
                     $ionicLoading.hide().then(function(){
                       console.log("The loading indicator is now hidden");
                    });  
                 }
                 else
                 {
                   $scope.showAlert("Login Error",data.Message);
                 }
            }).error(function (data, status, headers, config) {
                  $scope.invalid_login = "Sorry! invalid username/password";
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });

            }).finally(function () {
              // Hide loading spinner whether our call succeeded or failed.
              $scope.loading = false;
            });
   }

    $ionicModal.fromTemplateUrl('templates/view-by-category.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

   $scope.viewCategoryList =function()
   {
      $scope.loadStoreCategory();
     
   }
   $scope.closeViewByCategory= function(){
       $scope.modal.hide();
   }; 
     $scope.loadStoreCategory=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.base_url+"api/Store/BusinessTypeList",
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                 
                  var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                  $scope.business_type_data = d;// $scope.chunk(d ,3)
                console.log(data);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
                  $scope.modal.show();
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }
 
   $scope.setCategory=function(selectedCategory){
     localStorage.setItem("selectedCategory",selectedCategory);
     //$location.path("/app/near-by-store").replace();
       $scope.loadStoreData($scope.lat,$scope.lng);
        $scope.closeViewByCategory();
     
  }
  
  $scope.gotToHottestDeals = function(){
      $location.path("/app/hottest-deal").replace();
  };

   // $ionicNavBarDelegate.showBackButton(false);
    $ionicHistory.nextViewOptions({
        disableBack: false
      });
})
.controller("NearByStoreListCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading,StoreData,$compile,$ionicModal){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.getItem("selectedCategory");
   
    //alert($scope.selected_category);
    $scope.base_url=BaseUrl;
    $scope.store_list_url = $scope.base_url+"api/Store/List";
     $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.store_data=StoreData.getProperty();
    $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
    $scope.lat="";
    $scope.lng="";

 
//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;

   $scope.getCurrentPosition=function()
   {
       var options = {timeout: 10000, enableHighAccuracy: true};
         $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        
               var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              
               $scope.lat=position.coords.latitude;
               $scope.lng=position.coords.longitude;
               localStorage.setItem("lastLat",$scope.lat);
               localStorage.setItem("lastLng",$scope.lng);
                $scope.loadStoreData(position.coords.latitude,position.coords.longitude);
       
        }, function(error){
               console.log("Could not get location");
               console.log(error);
               $scope.getAlternateCurrentPosition();
        });
   };
   $scope.getAlternateCurrentPosition = function(){
       var latLong;
        $http({
            url:  "http://ipinfo.io",
            method: "GET"
        }).success(function (data, status, headers, config){
            console.log("Found location ["+data.loc+"] by ipinfo.io");
            latLong = data.loc.split(",");
           $scope.lat=latLong[0];
           $scope.lng=latLong[1];
           localStorage.setItem("lastLat",$scope.lat);
           localStorage.setItem("lastLng",$scope.lng);
            $scope.loadStoreData( $scope.lat, $scope.lng);

        }).error(function (data, status, headers, config) {
             console.log(error);
            }).finally(function () {
          $scope.loading = false;
        });


     };
   $scope.getCurrentPosition();

 
  
  $scope.setSelectedStoreAndRoute=function(current_store_id)
  {
     localStorage.setItem("selectedStoreId",current_store_id);
     $location.path("/app/store-option").replace();
    
  }

   $scope.loadStoreData=function(lat,lng){
         $scope.selected_category=localStorage.getItem("selectedCategory");
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
         
        var url = $scope.store_list_url +  "?lat=" + lat + "&lon=" + lng + "&limit=50&searchby=1&mileage=5&itemList=true&employeeList=true&dealList=true";
        if ($scope.selected_category != null && $scope.selected_category != undefined && $scope.selected_category!=''){
            url += "&type=" +$scope.selected_category;
        }

          var myJsonRequest = new Object();
              myJsonRequest.lat =lat;
              myJsonRequest.lng  =lng;  
              myJsonRequest.limit  =50;  
              myJsonRequest.searchby  =1;  
              myJsonRequest.mileage  =5;  
              myJsonRequest.itemList  =true;  
              myJsonRequest.employeeList  =true;  
              myJsonRequest.dealList  =true;  
              if($scope.selected_category != null && $scope.selected_category != undefined && $scope.selected_category!=''){
                 myJsonRequest.type  = $scope.selected_category;
              }

            $http({
                url:  url,
                method: "GET",
                  headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
            }).success(function (data, status, headers, config){
                if(data.Success)
                 {
                     StoreData.setProperty(data.StoreData);
                     $scope.store_data=data.StoreData;
                     $ionicLoading.hide().then(function(){
                       console.log("The loading indicator is now hidden");
                    });  
                 }
                 else
                 {
                   $scope.showAlert("Login Error",data.Message);
                 }
            }).error(function (data, status, headers, config) {
                  $scope.invalid_login = "Sorry! invalid username/password";
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });

            }).finally(function () {
              // Hide loading spinner whether our call succeeded or failed.
              $scope.loading = false;
            });
   }

    $ionicModal.fromTemplateUrl('templates/view-by-category.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

   $scope.viewCategoryList =function()
   {
      $scope.loadStoreCategory();
     
   }
   $scope.closeViewByCategory= function(){
       $scope.modal.hide();
   }; 
     $scope.loadStoreCategory=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.base_url+"api/Store/BusinessTypeList",
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                 
                  var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                  $scope.business_type_data = d;// $scope.chunk(d ,3)
                console.log(data);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
                  $scope.modal.show();
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }
 
   $scope.setCategory=function(selectedCategory){
     localStorage.setItem("selectedCategory",selectedCategory);
     //$location.path("/app/near-by-store").replace();
       $scope.loadStoreData($scope.lat,$scope.lng);
        $scope.closeViewByCategory();
     
  }
  $scope.gotToHottestDeals = function(){
      $location.path("/app/hottest-deal").replace();
  };
   // $ionicNavBarDelegate.showBackButton(false);
    $ionicHistory.nextViewOptions({
        disableBack: false
      });
})
.controller("StoreOptionCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading,StoreData){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/List";
    $scope.store_data=StoreData.getProperty();
 
     $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };


 
//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;
    
    $scope.rating = {};
    $scope.rating.rate = 3.5;
    $scope.rating.max = 5;

     $scope.rate=function(rating){
      alert(rating);
    };

    $scope.ratingsObject = {
        iconOn: 'ion-ios-star',    //Optional
        iconOff: 'ion-ios-star-outline',   //Optional
        iconOnColor: 'rgb(200, 200, 100)',  //Optional
        iconOffColor:  'rgb(200, 100, 100)',    //Optional
        rating:  3.5, //Optional
        minRating:1,    //Optional
        readOnly: true, //Optional
        callback: function(rating, index) {    //Mandatory
          $scope.ratingsCallback(rating, index);
        }
      };

      $scope.ratingsCallback = function(rating, index) {
        console.log('Selected rating is : ', rating, ' and the index is : ', index);
      };


})

.controller("SearchHotDealsCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading,Utils){
   $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/HotDeals?";
    $scope.image_url=$scope.base_url+"content/media/store/";
    $scope.hot_deals_data="";
    
    $scope.getImageUrl=function(src){
     
       if($scope.isImage(src))
        return src;
       else
        return "custom/images/no-image.png";
    };
    $scope.isImage=function(src){
         Utils.isImage($scope.source).then(function(result) {
            console.log(result);
            return result ;
        });
    };
      

   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.loading=true;


   $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
  
  $scope.chunk = function (arr, size) {
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
      newArr.push(arr.slice(i, i+size));
    }
    return newArr;
  }

  $scope.setCategory=function(selectedCategory){
    localStorage.setItem("selectedCategory",selectedCategory);
     $location.path("/app/near-by-store-map").replace();
  }

   $scope.searchHotDeals=function(lat,lng){

        $scope.url +="searchby=1&lat=" + lat + "&lon=" + lng + "&mileage=5&type=0&level=0&take=50";
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                 
                  var d =  JSON.parse(JSON.stringify(data.DealData));
                  $scope.hot_deals_data = $scope.chunk(d ,2)
                console.log(data);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }


   $scope.getCurrentPosition=function()
   {
       var options = {timeout: 10000, enableHighAccuracy: true};
         $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        
               var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              
               $scope.lat=position.coords.latitude;
               $scope.lng=position.coords.longitude;
               localStorage.setItem("lastLat",$scope.lat);
               localStorage.setItem("lastLng",$scope.lng);
                $scope.searchHotDeals(position.coords.latitude,position.coords.longitude);
       
        }, function(error){
               console.log("Could not get location");
               console.log(error);
               $scope.getAlternateCurrentPosition();
        });
   };
   $scope.getAlternateCurrentPosition = function(){
       var latLong;
        $http({
            url:  "http://ipinfo.io",
            method: "GET"
        }).success(function (data, status, headers, config){
            console.log("Found location ["+data.loc+"] by ipinfo.io");
            latLong = data.loc.split(",");
           $scope.lat=latLong[0];
           $scope.lng=latLong[1];
           localStorage.setItem("lastLat",$scope.lat);
           localStorage.setItem("lastLng",$scope.lng);
            $scope.searchHotDeals( $scope.lat, $scope.lng);

        }).error(function (data, status, headers, config) {
             console.log(error);
            }).finally(function () {
          $scope.loading = false;
        });


     };
   $scope.getCurrentPosition();


 
})
.controller("CustomSearchCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/BusinessTypeList";
    $scope.countryListUrl = $scope.base_url+"api/Store/CountryList";
    $scope.stateListUrl = $scope.base_url+"api/Store/StateList";
    $scope.cityListUrl = $scope.base_url+"api/Store/CityList";
    $scope.storeListUrl = $scope.base_url+"api/Store/List";
    
    $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.business_type_data="";
    $scope.gender="";

//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;


     $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };

 $scope.searchBy = {
    searchByOptions : [
      {id: 1, name: "Mileage", selected: true},
      {id: 1, name: "Kilometer", selected: false},
      {id: 2, name: "Zip", selected: false},
      {id: 3, name: "City", selected: false},
      {id: 4, name: "State", selected: true},
      {id: 5, name: "Country", selected: false}
    ],
    searchByOption:  {id: 1, name: "Mileage", selected: true}
  };
 
 $scope.countryList = {};
 $scope.countryList.country = {id:'',name:'',selected:false};
 $scope.stateList = {};
 $scope.stateList.state = {id:'',name:'',selected:false};
 $scope.cityList = {};
 
 $scope.businessTypes={};
 $scope.serach_type="";

$scope.show_country=false;
$scope.show_state=false;
$scope.show_city=false;
$scope.show_search_value=true;
$scope.show_zip_code=false;

$scope.$watch("searchBy.searchByOption.name", function(){
   if($scope.searchBy.searchByOption.id)
     switch($scope.searchBy.searchByOption.id)
     {
        case '1':
        case 1:
            $scope.show_country=false;
            $scope.show_state=false;
            $scope.show_city=false;
            $scope.show_zip_code=false;
            $scope.show_search_value=true;
        break;
        case '2':
        case 2:
            $scope.show_country=true;
            $scope.show_state=false;
            $scope.show_city=false;
             $scope.show_zip_code=true;
            $scope.show_search_value=false;
        break;
        case '3':
        case 3:
            $scope.show_country=true;
            $scope.show_state=true;
            $scope.show_city=true;
             $scope.show_zip_code=false;
            $scope.show_search_value=false;
        break;
        case '4':
        case 4:
            $scope.show_country=true;
            $scope.show_state=true;
            $scope.show_city=false;
             $scope.show_zip_code=false;
            $scope.show_search_value=false;
        break;
        case '5':
        case 5:
            $scope.show_country=true;
            $scope.show_state=false;
            $scope.show_city=false;
             $scope.show_zip_code=false;
            $scope.show_search_value=false;
        break;
        default:
        break;
     }    
}, true);


$scope.$watch("countryList.country.name", function(){
   if($scope.countryList.country.id)
     $scope.loadState($scope.countryList.country.id);
}, true);

$scope.$watch("stateList.state.name", function(){
   if($scope.stateList.state.id)
     $scope.loadCity($scope.countryList.country.id,$scope.stateList.state.id);
}, true);


$scope.doCustomSearch=function(customSearch){
   var url ="";
  
   var search_value = (customSearch && customSearch.searchValue) ? customSearch.searchValue : "";
   var zip_code=  (customSearch && customSearch.zipCode) ? customSearch.zipCode : "";  
   switch($scope.searchBy.searchByOption.id)
     {
        case '1':
        case 1:
           url+="&searchby=1&mileage="+search_value;
        break;
        case '2':
        case 2:
             url+="&searchby=2&zip="+zip_code+"&isAdvancedSearch=true"+"&country="+$scope.countryList.country.id;
        break;
        case '3':
        case 3:
            url+="&searchby=3&isAdvancedSearch=true"+"&country="+$scope.countryList.country.id+"&state="+$scope.stateList.state.id+"&city="+$scope.cityList.city.id;
        break;
        case '4':
        case 4:
           url+="&searchby=4&isAdvancedSearch=true"+"&country="+$scope.countryList.country.id+"&state="+$scope.stateList.state.id;
        break;
        case '5':
        case 5:
           url+="&searchby=5&isAdvancedSearch=true"+"&country="+$scope.countryList.country.id;
        break;
        default:
        break;
     } 
     localStorage.setItem("search_url",url); 
    //  $location.path("/app/dashboard").replace();
     $location.path('/app/near-by-store-map').search({referer: 'cs'}).replace();
     //$location.search('/app/near-by-store-map', 'cs');
    // $location.path("/app/near-by-store-map?referer=cs").replace();
};

       $scope.loadStoreCategory=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                  var categories=[];
                  var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                  for(i=0;i<d.length;i++)
                  {
                    categories.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }
                  $scope.businessTypes.categories=categories
                  $scope.businessTypes.selected_category=null;
                  if(categories.length>0)
                    $scope.businessTypes.selected_category=categories[0];

                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }


       $scope.loadCountry=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.countryListUrl,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
             // console.log(data.CountryData); 
                  var myData=[];
                  var d = data.CountryData;//angular.toJson(angular.fromJson(data.CountryData));
                 //  console.log(d);
                  for(i=0;i<d.length;i++)
                  {
                    myData.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }
                  $scope.countryList.countries=myData
                  $scope.countryList.country= {id:'',name:'',selected:false};

                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }
       $scope.loadState=function(country){
        var url = $scope.stateListUrl+"?countryCode="+country;
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url: url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                var myData=[];
                  var d = data.StateData;//JSON.parse(JSON.stringify(data.StateData));
                 //console.log(data);return;
                
                  for(i=0;i<d.length;i++)
                  {
                    myData.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }

                  $scope.stateList.states=myData
                  $scope.stateList.state= {id:'',name:'',selected:false};

                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }
       $scope.loadCity=function(country,state){
     
           var url = $scope.cityListUrl+"?countryCode="+country+"&stateCode="+state;
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit=50;  
          

        $http({
            url:  url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                  var myData=[];
                   var d = data.CityData;
                  //var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                  for(i=0;i<d.length;i++)
                  {
                    myData.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }
                  $scope.cityList.cities=myData
                  $scope.cityList.city=null;

                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }

 $scope.loadStoreCategory();
 $scope.loadCountry();
 
    
   

})
.controller("AdvanceSearchCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/BusinessTypeList";
    $scope.countryListUrl = $scope.base_url+"api/Store/CountryList";
    $scope.stateListUrl = $scope.base_url+"api/Store/StateList";
    $scope.cityListUrl = $scope.base_url+"api/Store/CityList";
    $scope.storeListUrl = $scope.base_url+"api/Store/List";
    
    $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.business_type_data="";
    $scope.gender="";

//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;


     $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };

 $scope.searchBy = {
    searchByOptions : [
      {id: 1, name: "Mileage", selected: true},
      {id: 1, name: "Kilometer", selected: false},
      {id: 2, name: "Zip", selected: false},
      {id: 3, name: "City", selected: false},
      {id: 4, name: "State", selected: true},
      {id: 5, name: "Country", selected: false}
    ],
    searchByOption:  {id: 1, name: "Mileage", selected: true}
  };
 
 $scope.countryList = {};
 $scope.countryList.country = {id:'',name:'',selected:false};
 $scope.stateList = {};
 $scope.stateList.state = {id:'',name:'',selected:false};
 $scope.cityList = {};
 
 $scope.businessTypes={};
 $scope.serach_type="";


$scope.$watch("countryList.country.name", function(){
   if($scope.countryList.country.id)
     $scope.loadState($scope.countryList.country.id);
}, true);

$scope.$watch("stateList.state.name", function(){
   if($scope.stateList.state.id)
     $scope.loadCity($scope.countryList.country.id,$scope.stateList.state.id);
}, true);


$scope.doAdvanceSearch=function(advanceSearch){
   var url ="";
  
   var search_value = (advanceSearch && advanceSearch.searchValue) ? advanceSearch.searchValue : "";
   var zip_code=  (advanceSearch && advanceSearch.zipCode) ? advanceSearch.zipCode : "";  
   var businessName=  (advanceSearch && advanceSearch.businessName) ? advanceSearch.businessName : "";  
   
   url+="&isAdvancedSearch=true";
   url+="&mileage="+search_value;
   url+="&zip="+zip_code+"&country="+$scope.countryList.country.id;
   url+="&state="+$scope.stateList.state.id+"&city="+$scope.cityList.city.id;
   url+="&businessName="+businessName;
   localStorage.setItem("search_url",url); 
   $location.path('/app/near-by-store-map').search({referer: 'cs'}).replace();
};

       $scope.loadStoreCategory=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                  var categories=[];
                  var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                  for(i=0;i<d.length;i++)
                  {
                    categories.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }
                  $scope.businessTypes.categories=categories
                  $scope.businessTypes.selected_category=null;
                  if(categories.length>0)
                    $scope.businessTypes.selected_category=categories[0];

                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }


       $scope.loadCountry=function(){
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.countryListUrl,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
             // console.log(data.CountryData); 
                  var myData=[];
                  var d = data.CountryData;//angular.toJson(angular.fromJson(data.CountryData));
                 //  console.log(d);
                  for(i=0;i<d.length;i++)
                  {
                    myData.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }
                  $scope.countryList.countries=myData
                  if(myData.length>0)
                    $scope.countryList.country=myData[0];

                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }
       $scope.loadState=function(country){
        var url = $scope.stateListUrl+"?countryCode="+country;
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url: url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                var myData=[];
                  var d = data.StateData;//JSON.parse(JSON.stringify(data.StateData));
                 //console.log(data);return;
                
                  for(i=0;i<d.length;i++)
                  {
                    myData.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }

                  $scope.stateList.states=myData
                  if(myData.length>0)
                    $scope.stateList.state=myData[0];
                 
                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }
       $scope.loadCity=function(country,state){
     
           var url = $scope.cityListUrl+"?countryCode="+country+"&stateCode="+state;
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit=50;  
          

        $http({
            url:  url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                  var myData=[];
                   var d = data.CityData;
                  //var d =  JSON.parse(JSON.stringify(data.BusinessTypeData));
                  for(i=0;i<d.length;i++)
                  {
                    myData.push({id:d[i].Value,name:d[i].Name,selected:false});

                  }
                  $scope.cityList.cities=myData
                   if(myData.length>0)
                    $scope.cityList.city=myData[0];
                 

              
                //  $scope.editUser.users=categories;
                  //$scope.editUser.user=null;


            //      $scope.business_type_data = d; //$scope.chunk(d ,3)
                 // console.log( d);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
      }

 $scope.loadStoreCategory();
 $scope.loadCountry();
 
    
 
})
.controller("MyAccountCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/BusinessTypeList";
    $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.business_type_data="";
    

//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;


     $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
 
})
.controller("MyFavoriteListCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/BusinessTypeList";
    $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.business_type_data="";
    

//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;


     $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
 
})
.controller("SuggestMerchantCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading){
    $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/BusinessTypeList";
    $scope.image_url=$scope.base_url+"content/media/bCategory/";
    $scope.business_type_data="";
    

//alert($scope.authenticationToken);
   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.is_map=true;
    $scope.loading=true;


     $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
 
})
.controller("HottestDealCtrl",function($rootScope,$scope,$http, $ionicNavBarDelegate,$ionicHistory,$localStorage,$location,PageTitle,ProfileData,$state, $cordovaGeolocation,BaseUrl,$ionicPopup,$ionicLoading,Utils){
   $scope.pageTitle=PageTitle.getProperty();
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_category=localStorage.selectedGategory;
    $scope.selected_store_id=localStorage.selectedStoreId;
    $scope.base_url=BaseUrl;
    $scope.url = $scope.base_url+"api/Store/AllDeals?";
    $scope.image_url=$scope.base_url+"content/media/store/";
    $scope.hot_deals_data="";
    $scope.latest_deals_data="";

    $scope.getImageUrl=function(src){
     
       if($scope.isImage(src))
        return src;
       else
        return "custom/images/no-image.png";
    };
    $scope.isImage=function(src){
         Utils.isImage($scope.source).then(function(result) {
            console.log(result);
            return result ;
        });
    };
      

   if($scope.profile==null || $scope.authenticationToken==undefined || $scope.userId == undefined)
   {
     $location.path("/app/login").replace();
   }
    $scope.loading=true;


   $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title || 'Don\'t eat that!',
       template: message || 'It might taste good'
     });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
  
  $scope.chunk = function (arr, size) {
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
      newArr.push(arr.slice(i, i+size));
    }
    return newArr;
  }

  $scope.setCategory=function(selectedCategory){
    localStorage.setItem("selectedCategory",selectedCategory);
     $location.path("/app/near-by-store-map").replace();
  }

   $scope.searchHotDeals=function(lat,lng){

        $scope.url +="searchby=1&lat=" + lat + "&lon=" + lng + "&mileage=5&type=0&level=0&take=50";
     
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

       
          var myJsonRequest = new Object();
              myJsonRequest.limit  =50;  
          

        $http({
            url:  $scope.url,
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                 
                  var d =  JSON.parse(JSON.stringify(data.LatestDeals));
                  $scope.latest_deals_data = $scope.chunk(d ,2);

                  $scope.hot_deals_data = JSON.parse(JSON.stringify(data.HotDeals));
                console.log(data);
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               $scope.showAlert("Login Error",data.Message);
             }
        }).error(function (data, status, headers, config) {
             $scope.invalid_login = "Sorry! invalid username/password";
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }


   $scope.getCurrentPosition=function()
   {
       var options = {timeout: 10000, enableHighAccuracy: true};
         $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        
               var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              
               $scope.lat=position.coords.latitude;
               $scope.lng=position.coords.longitude;
               localStorage.setItem("lastLat",$scope.lat);
               localStorage.setItem("lastLng",$scope.lng);
                $scope.searchHotDeals(position.coords.latitude,position.coords.longitude);
       
        }, function(error){
               console.log("Could not get location");
               console.log(error);
               $scope.getAlternateCurrentPosition();
        });
   };
   $scope.getAlternateCurrentPosition = function(){
       var latLong;
        $http({
            url:  "http://ipinfo.io",
            method: "GET"
        }).success(function (data, status, headers, config){
            console.log("Found location ["+data.loc+"] by ipinfo.io");
            latLong = data.loc.split(",");
           $scope.lat=latLong[0];
           $scope.lng=latLong[1];
           localStorage.setItem("lastLat",$scope.lat);
           localStorage.setItem("lastLng",$scope.lng);
            $scope.searchHotDeals( $scope.lat, $scope.lng);

        }).error(function (data, status, headers, config) {
             console.log(error);
            }).finally(function () {
          $scope.loading = false;
        });


     };
   $scope.getCurrentPosition();
 
})
