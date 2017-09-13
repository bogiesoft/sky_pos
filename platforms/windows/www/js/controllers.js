var app = angular.module('skypos.controllers', ['ngStorage','jkAngularRatingStars','angularMoment','ngSweetAlert'])



app.config(["$httpProvider", function ($httpProvider) {
     $httpProvider.defaults.transformResponse.push(function(responseData){
        return responseData;
    });
}])




app.controller('AppCtrl', function($scope, $ionicModal, $timeout,$ionicSideMenuDelegate,$location,ProfileData) {
  
  $scope.toggleMenu=function(){
      $ionicSideMenuDelegate.toggleLeft();
  };

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

 

  $scope.doLogout=function(){

               localStorage.removeItem("Id");
               localStorage.removeItem("AccessToken");
               localStorage.removeItem("Email");
               ProfileData.setProperty("null");
               $location.path("/app/login").replace();
  };

})

.controller("LoginCtrl",function($rootScope,$scope,$http,$location,$ionicHistory,$localStorage,$sessionStorage,$cordovaOauth,$ionicPopup,$ionicModal,$ionicLoading,ProfileData,$ionicSideMenuDelegate,Utils,StoreInfo){
   
   $ionicSideMenuDelegate.canDragContent(false)
   
   
    
    if(Utils.isLoggedIn())
   {
     $location.path("/app/dashboard").replace();
   }
   else
   {
    
    console.log($scope.profile);
    console.log($scope.authenticationToken);
    
    console.log($scope.userId);
    
     // 
   }
   
   $scope.data={logo:'custom/images/logo-legacy.png'};
   if(Utils.isTestMode())
   {
     $scope.txtEmail = 'ashrafdomain@gmail.com';
     $scope.txtPassword = '7Vg0Q2';
   }
 

  
   /********** login with email start *********/
    // Form data for the login modal
   $scope.loginData = {};

    $scope.loginModal=null;
   $ionicModal.fromTemplateUrl('templates/login_modal.html', {
    scope: $scope
   }).then(function(modal) {
    $scope.loginModal = modal;
   });

    // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };

  // Open the login modal
  $scope.login = function(){
    $scope.loginModal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
     /********** login with email end *********/


  
   $scope.pins={pin1:null,pin2:null,pin3:null,pin4:null};
   $scope.pinSet=function(number)
   {
      if($scope.pins.pin1==null)
      {
        $scope.pins.pin1=number;
        return;
      }

      if($scope.pins.pin2==null)
      {
        $scope.pins.pin2=number;
        return;
      }
       if($scope.pins.pin3==null)
      {
        $scope.pins.pin3=number;
        return;
      }
       if($scope.pins.pin4==null)
      {
        $scope.pins.pin4=number;
        $scope.loginRequest("pin");
        //Utils.showAlert("Login Error",$scope.getPin());
        
        return;
      }
   }
   
   $scope.clearPin=function()
   {
      if($scope.pins.pin4!=null)
      {
        $scope.pins.pin4=null;
        return;
      }
      if($scope.pins.pin3!=null)
      {
        $scope.pins.pin3=null;
        return;
      }
      if($scope.pins.pin2!=null)
      {
        $scope.pins.pin2=null;
        return;
      }
      if($scope.pins.pin1!=null)
      {
        $scope.pins.pin1=null;
        return;
      }
   }
   $scope.clearAllPin = function(){
        $scope.pins={pin1:null,pin2:null,pin3:null,pin4:null};
   }

   $scope.getPin = function()
   {
      return $scope.pins.pin1+""+$scope.pins.pin2+""+$scope.pins.pin3+""+$scope.pins.pin4;
   }

   $scope.padNumberClick = function(number)
   {
     $scope.pinSet(number);  
   }

   $scope.fbLogin = function() {
        $cordovaOauth.facebook("CLIENT_ID_HERE", ["email", "read_stream", "user_website", "user_location", "user_relationships"]).then(function(result) {
            $localStorage.accessToken = result.access_token;
            $location.path("/app/dashboard").replace();
        }, function(error) {
            alert("There was a problem signing in!  See the console for logs");
            console.log(error);
        });
    };

 

   $scope.loginRequest = function(login_type)
   {
      
       $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
         var url="";
         var myJsonRequest = new Object();
          if(login_type=='email')
          {
              url=Utils.getApiURL("login_email");
              myJsonRequest.email =$scope.loginData.email;
              myJsonRequest.password  =$scope.loginData.password;   
          }
          else 
          {
            url=Utils.getApiURL("login_access_code");
            myJsonRequest.accessCode = $scope.getPin();
          }
              


       $http({
             url: url,
            method: "POST",
            data: JSON.stringify(myJsonRequest),
            headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
             
             $scope.clearAllPin();

             $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });
            if(data.Success)
            {
              //console.log(data); return;
              localStorage.setItem("Id",data.Data.Id);
              localStorage.setItem("AccessToken","public 1234567890");
              localStorage.setItem("Email",data.Data.AccessToken);
              ProfileData.setProperty(data.Data);
              data.StoreInfo.TaxRate = data.TaxRate;
              StoreInfo.setProperty(data.StoreInfo);  
              $location.path("/app/dashboard").replace();
            }
            else
            {
               Utils.showAlert("Login Error",data.Message);
            }
             
             console.log(data);
           
        }).error(function (data, status, headers, config) {
            $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });
            Utils.showAlert("Login Error","Login failed, please try again");
        });

     
       
   }
   // 
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

})

.controller("ClockInCtrl",function($rootScope,$scope,$http,$location,$ionicHistory,$timeout,$cordovaOauth,$ionicPopup,$ionicLoading,ProfileData,$ionicSideMenuDelegate,Utils){
      $ionicSideMenuDelegate.canDragContent(false)

   $scope.date = moment().format('MM-DD-YYYY');
   $scope.time = moment().format('hh:mm A');
  $scope.timeInMs = 1000;
  var countUp = function() {
        $scope.timeInMs+= 1000;
        $timeout(countUp, 100);
        $scope.time = moment().format('hh:mm A');
    }

    $timeout(countUp, 1000);

  

   $scope.pins={pin1:null,pin2:null,pin3:null,pin4:null};
   $scope.pinSet=function(number)
   {
      if($scope.pins.pin1==null)
      {
        $scope.pins.pin1=number;
        return;
      }

      if($scope.pins.pin2==null)
      {
        $scope.pins.pin2=number;
        return;
      }
       if($scope.pins.pin3==null)
      {
        $scope.pins.pin3=number;
        return;
      }
       if($scope.pins.pin4==null)
      {
        $scope.pins.pin4=number;
        Utils.showAlert("Login Error",$scope.getPin());
        $scope.clearAllPin();
        return;
      }
   }
   
   $scope.clearPin=function()
   {
      if($scope.pins.pin4!=null)
      {
        $scope.pins.pin4=null;
        return;
      }

      if($scope.pins.pin3!=null)
      {
        $scope.pins.pin3=null;
        return;
      }
       if($scope.pins.pin2!=null)
      {
        $scope.pins.pin2=null;
        return;
      }
       if($scope.pins.pin1!=null)
      {
        $scope.pins.pin1=null;
        return;
      }
   }
   $scope.clearAllPin = function(){
        $scope.pins={pin1:null,pin2:null,pin3:null,pin4:null};
   }

   $scope.getPin = function()
   {
      return $scope.pins.pin1+""+$scope.pins.pin2+""+$scope.pins.pin3+""+$scope.pins.pin4;
   }

   $scope.padNumberClick = function(number)
   {
     $scope.pinSet(number);  
   }
})
.controller("ClockOutCtrl",function($rootScope,$scope,$http,$location,$ionicHistory,$timeout,$cordovaOauth,$ionicPopup,$ionicLoading,ProfileData,$ionicSideMenuDelegate,Utils){
      $ionicSideMenuDelegate.canDragContent(false)

   $scope.date = moment().format('MM-DD-YYYY');
   $scope.time = moment().format('hh:mm A');
  $scope.timeInMs = 1000;
  var countUp = function() {
        $scope.timeInMs+= 1000;
        $timeout(countUp, 100);
        $scope.time = moment().format('hh:mm A');
    }

    $timeout(countUp, 1000);

  

   $scope.pins={pin1:null,pin2:null,pin3:null,pin4:null};
   $scope.pinSet=function(number)
   {
      if($scope.pins.pin1==null)
      {
        $scope.pins.pin1=number;
        return;
      }

      if($scope.pins.pin2==null)
      {
        $scope.pins.pin2=number;
        return;
      }
       if($scope.pins.pin3==null)
      {
        $scope.pins.pin3=number;
        return;
      }
       if($scope.pins.pin4==null)
      {
        $scope.pins.pin4=number;
        Utils.showAlert("Login Error",$scope.getPin());
        $scope.clearAllPin();
        return;
      }
   }
   
   $scope.clearPin=function()
   {
      if($scope.pins.pin4!=null)
      {
        $scope.pins.pin4=null;
        return;
      }

      if($scope.pins.pin3!=null)
      {
        $scope.pins.pin3=null;
        return;
      }
       if($scope.pins.pin2!=null)
      {
        $scope.pins.pin2=null;
        return;
      }
       if($scope.pins.pin1!=null)
      {
        $scope.pins.pin1=null;
        return;
      }
   }
   $scope.clearAllPin = function(){
        $scope.pins={pin1:null,pin2:null,pin3:null,pin4:null};
   }

   $scope.getPin = function()
   {
      return $scope.pins.pin1+""+$scope.pins.pin2+""+$scope.pins.pin3+""+$scope.pins.pin4;
   }

   $scope.padNumberClick = function(number)
   {
     $scope.pinSet(number);  
   }
})
.controller("DashboardCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    
     

    $scope.gotoPage = function(page_name){
         $location.path("/app/"+page_name).replace();
        switch(page_name)
        {
            case 'order':
                console.log(page_name);
            break;
             case 'reservation':
                console.log(page_name);
            break;
             case 'tips':
                console.log(page_name);
            break;
             case 'admin_tools':
                console.log(page_name);
            break;    

        }
    };
})
.controller("OrderCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils, $ionicLoading,ProductData,$stateParams){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();
   // $ionicConfig.tabs.position.("top");
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="order";
    $scope.page_referer=$stateParams.page_referer;
    console.log($scope.page_referer);
    $scope.categories = [];
   $scope.image_base_url=Utils.getApiURL("image_base_url");
   $scope.loadCategories=function(){
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = new Object();
            myJsonRequest.limit  =50;  

        $http({
            url: Utils.getApiURL("all_category_list"),
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                   ProductData.setProperty(data.Data);
                   var d =  angular.fromJson(data.Data);
                    console.log(data);
                    $scope.categories = Utils.chunk(d ,2);
                    
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               Utils.showAlert("Search Hot Deals",data.Message);
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

     $scope.loadCategories();

    $scope.gotoOrderCategoryItem=function(category){
     // Utils.showAlert("aa",category);
       $location.path("/app/order-category-item/"+category).replace();
    };
})
.controller("OrderCategoryItemCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,ProductData,$stateParams){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();
    $scope.image_base_url=Utils.getApiURL("image_base_url");
    $scope.page_referer = $stateParams.page_referer;
    //console.log($scope.page_referer);

    $scope.product_data = ProductData.getProperty();
    $scope.selected_category=$stateParams.category;
    $scope.items=[];
    if($scope.product_data.length>0)
    {  //console.log($scope.product_data);
       for(i=0;i<$scope.product_data.length;i++)
       {
           var product=$scope.product_data[i];
           if(product.Category==$scope.selected_category)
           {
              $scope.items=product.Items;
           }
       }
    }
  
    $scope.selected_category=$stateParams.category;
    //console.log($scope.selected_category);

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="order";
    
    $scope.categories = [];
   

}) 
.controller("OrderProvisionItemCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,$stateParams,$ionicLoading,$ionicModal,StoreInfo,OrderData){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();
    $scope.item=$stateParams.item;
    $scope.page_referer = $stateParams.page_referer;
    $scope.current_order_type=localStorage.current_order_type;

   // console.log($scope.current_order_type);
    $scope.image_base_url=Utils.getApiURL("image_base_url");
    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.items=[];
    $scope.provision_items=[];
    $scope.selected_tab="order";
    $scope.selected_provision_items=[];
    $scope.item_options=[];

    
   
     $scope.loadOrderProvisionItems=function(item){
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });

         var url = Utils.getApiURL("provision_items")+"?type="+encodeURIComponent(item);
       //  Utils.showAlert("jj",url);
         var myJsonRequest = new Object();
            //  myJsonRequest.item  = item;  

        $http({
            url: url,
            method: "GET",
            // data: JSON.stringify(myJsonRequest),
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'},

        }).success(function (data, status, headers, config){
            if(data.Success)
             {
              //    console.log(data.ProvisionItemsList);
                  // ProductData.setProperty(data.Data);
                   var d =  angular.fromJson(data.ProvisionItemsList);
                    $scope.items = d;
                   
                 $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               Utils.showAlert("Search Hot Deals",data.Message);
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

    $scope.loadOrderProvisionItems($scope.item);

    $scope.itemOptionModal=null;
    $ionicModal.fromTemplateUrl('templates/item_option_modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.itemOptionModal = modal;
      $scope.itemOptionModal.backdropClickToClose=false;
    });
      // Open the login modal
    $scope.showItemOptionModal = function(){
      $scope.itemOptionModal.show();
    };

     // Triggered in the login modal to close it
    $scope.closeItemOptionModal = function() {
      $scope.itemOptionModal.hide();
    };
    //*

    $scope.customerDeliveryInfoModal=null;
    $ionicModal.fromTemplateUrl('templates/customer-delivery-info-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.customerDeliveryInfoModal = modal;
      $scope.customerDeliveryInfoModal.backdropClickToClose=false;
    });
      // Open the login modal
    $scope.showCustomerDeliveryInfoModal = function(){
      $scope.customerDeliveryInfoModal.show();
    };

     // Triggered in the login modal to close it
    $scope.closeCustomerDeliveryInfoModal = function() {
      $scope.customerDeliveryInfoModal.hide();
    };
    $scope.customer_delivery_info_model={};
    

     
     $scope.orderDetails=[];
    $scope.myOrderProvisionItem={};
    
     $scope.selectProvisionItem=function(index){
          $selected_items=[];
          $clicked_item =$scope.items[index];
          $scope.myOrderProvisionItem = {};
          $scope.provision_items[index]=!$scope.provision_items[index]
          // console.log($scope.provision_items);
          if($scope.provision_items[index])
          {
              $scope.selected_provision_items.push($clicked_item );
              
              $scope.myOrderProvisionItem.ID="";
              $scope.myOrderProvisionItem.Quantity=1;
              $scope.myOrderProvisionItem.Price=$clicked_item.Price;
              $scope.myOrderProvisionItem.OrderID="";
              $scope.myOrderProvisionItem.ProvisionName=$clicked_item.Name;
                         
 
            //  console.log($clicked_item.OptionsList.length);
              if($clicked_item.OptionsList.length>0)
              {
                   $scope.item_options = $clicked_item.OptionsList;
                   $scope.showItemOptionModal();
                   //Utils.showAlert("",$clicked_item.OptionsList.length);


              }
              else
              {
                $scope.orderDetails.push($scope.myOrderProvisionItem);
              }
          }
          else
          {
            //$scope.selected_provision_items.pop($clicked_item );
            $scope.selected_provision_items.splice( index, 1 );
           // var order_details_index = $scope.orderDetails.indexOf($scope.myOrderProvisionItem);
            $scope.orderDetails.splice( index, 1 );
             $scope.myOrderProvisionItem={};
          }
        //  console.log($scope.selected_provision_items);
    };

    $scope.new_item_option="";
    $scope.provision_item_options=[];
    $scope.selected_provision_item_options=[];

     
    
    
     $scope.modifierItems=[];
     $scope.modifierItem={};
     $scope.order={};
     

     
    $scope.selectProvisionItemOption=function(index){
          selected_items=[];
          clicked_item_option =$scope.item_options[index];
          //console.log(clicked_item_option);
          var clickedModifierItem={};
          clickedModifierItem.ModifierName=clicked_item_option.Name;
          clickedModifierItem.ModifierPrice=0;
          clickedModifierItem.OrderDetailID=""
          clickedModifierItem.ComboChildName=""
          
         // $scope.modifierItems.push(clickedModifierItem);

         
          $scope.provision_item_options[index]=!$scope.provision_item_options[index]
          // console.log($scope.provision_items);
          if($scope.provision_item_options[index])
          {
              $scope.selected_provision_item_options.push(clicked_item_option );
              $scope.modifierItems.push(clickedModifierItem);
             
          }
          else
          {
            $scope.selected_provision_item_options.pop(clicked_item_option );
             $scope.selected_provision_item_options.splice( index, 1 );
           // $scope.modifierItems.pop(clickedModifierItem);
             $scope.modifierItems.splice( index, 1 );
          }
      //  console.log($scope.modifierItems);
      //  console.log($scope.myOrderProvisionItem);
    };


    $scope.addNewItemOption = function(new_item_option){
     // console.log($scope.new_item_option);
        $scope.new_item_option=new_item_option
      
        if(!$scope.new_item_option)
        {
          Utils.showAlert("New Ingredient","Ingredient name cannot be empty");
          return;
        }
        new_item={};
        new_item.Name=$scope.new_item_option;
        $scope.item_options.push(new_item);
        
       /* modifierItem={};
        modifierItem.modifierName=$scope.new_item_option;
        modifierItem.modifierPrice=0;
        modifierItem.orderDetailID=""

        $scope.modifierItems.push(modifierItem);
      */
        $scope.new_item_option = "";
    };

    $scope.ingredientSelectionDone=function(){
          if($scope.modifierItems.length>0){
             $scope.myOrderProvisionItem.modifierItems = $scope.modifierItems;
            $scope.orderDetails.push($scope.myOrderProvisionItem);
          }
          $scope.modifierItems=[];
          $scope.closeItemOptionModal();
          $scope.item_options=[];
          $scope.provision_item_options=[];
    };


     $scope.orderProvisionItem=function(type){
       
       
       
       var profile = ProfileData.getProperty();
       var storeInfo = StoreInfo.getProperty();

       if($scope.page_referer=="order_edit" || $scope.page_referer=="recall_order_edit")
       {
          $scope.order = OrderData.getProperty();
          $scope.existing_order_details=$scope.order.OrderDetails;

          if($scope.orderDetails.length>0)
          {
              for (var i=0; i<$scope.orderDetails.length; i++){
                  $scope.order.OrderDetails.push($scope.orderDetails[i]);
              }
          } 

       }
       else
       {
         $scope.order = {};
         $scope.order.NumOfOTable=1;
         $scope.order.Total=1;
         $scope.order.EmployeeID = profile.Id
         $scope.order.OrderDetails = $scope.orderDetails;
         $scope.order.IsReservation=false;
         $scope.order.OrderID = "";
         $scope.order.Status="1";
         $scope.order.ODate =  moment().format('YYYY-MM-DD')+"T"+ moment().format('HH:mm:ss');
         $scope.order.OType="Take Out";
         $scope.order.CustomerPhone = "";
         $scope.order.CustomerAddress ="";

         $scope.order.Discount =0;
         $scope.order.TotalRec=0;
         $scope.order.OSum = 0;
         $scope.order.NumPeople = 0;
         $scope.order.Tax = 0;
         $scope.order.OTable = "Take Away";
         $scope.order.ServiceCharge = 0;
       }
   
       if($scope.order.OrderDetails.length>0)
       {
            var order_total=0;
            var tax_rate = storeInfo.TaxRate;

            for(i=0;i<$scope.order.OrderDetails.length;i++)
            {
               var my_order_item = $scope.order.OrderDetails[i];
               order_total += my_order_item.Price;
            }
            $scope.order.OSum=order_total;
            var tax = order_total * (tax_rate/100);
            $scope.order.Tax=tax;

          
            //console.log(type);
            localStorage.current_order_type=type;
            switch(type)
            {
              case "delivery":
                 $scope.order.OType="Delivery";
                if($scope.page_referer!="order_edit")
                {
                  if(!$scope.customer_delivery_info_model.name)
                  {
                    Utils.showAlert("Customer Info","Please enter customer name");
                    return;
                  }  
                  if(!$scope.customer_delivery_info_model.phone)
                  {
                    Utils.showAlert("Customer Info","Please enter customer phone");
                    return;
                  }
                  $scope.order.CustomerFirstName = $scope.customer_delivery_info_model.name || "";
                  $scope.order.CustomerLastName = "";
                  $scope.order.CustomerPhone = $scope.customer_delivery_info_model.phone || "";
                  $scope.order.CustomerAddress = $scope.customer_delivery_info_model.address || "";
                  $scope.closeCustomerDeliveryInfoModal();
                }
                OrderData.setProperty($scope.order); 
                if($scope.page_referer=="recall_order_edit")
                  $location.path("/app/recall-order-edit").replace();
               else   
                  $location.path("/app/order-edit").replace();
              break;
              case "take_out":
                   $scope.order.OType="Take Out";
                   OrderData.setProperty($scope.order);
                   if($scope.page_referer=="recall_order_edit")
                      $location.path("/app/recall-order-edit").replace();
                   else   
                      $location.path("/app/order-edit").replace();
              break;
              case "dine_in":
                   $scope.order.OType="Dine In";

                   OrderData.setProperty($scope.order);
                   if($scope.page_referer=="order_edit")
                   {
                      $location.path("/app/order-edit").replace();
                   }
                   else if($scope.page_referer=="recall_order_edit")
                      $location.path("/app/recall-order-edit").replace();
                   else
                        $location.path("/app/service-floor").replace();
                  
                      
              break;
              
            }
            
         // console.log($scope.selected_provision_items);
        }
       else
        {
          Utils.showAlert("Item Selection","Please select an item to continue");
        }
    };

    //*/

})
.controller("OrderEditCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,OrderData,$document,$ionicLoading,$state,$ionicModal){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="order";
    $scope.items=[];
    $scope.order_data = OrderData.getProperty();
    $scope.order_details = $scope.order_data.OrderDetails;
   // console.log($scope.order_data);
   
    $scope.setClass = function ($event,index){
       var scope_var ="my-row-"+index;
       var my_row_element = angular.element($document[0].querySelector('#my-row-'+index));
       var my_button_element = angular.element($document[0].querySelector('#my-button-'+index));
       
       if(my_row_element.hasClass('shift-left'))
          my_row_element.removeClass('shift-left').addClass("shift-right");
       else
        my_row_element.addClass('shift-left').removeClass("shift-right");
       
       if(my_button_element.hasClass('button-shift-right'))
          my_button_element.removeClass('button-shift-right').addClass("button-shift-left");
       else
        my_button_element.addClass('button-shift-right').removeClass("button-shift-left");
    };

    $scope.removeOrderItem = function(index){
    
      $scope.order_details.splice( index, 1 );
      $scope.order_data.OrderDetails = $scope.order_details;
      OrderData.setProperty($scope.order_data);
    //  $scope.order_details.pop($scope.order_details[index]);
    };

    $scope.quantityEditModal=null;
    $ionicModal.fromTemplateUrl('templates/quantity-edit-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.quantityEditModal = modal;
    });

    
    $scope.openQuantityEditModal = function(index) {
      $scope.quantity_edit_model.selected_index=index;
      $scope.quantity_edit_model.quantity =$scope.order_data.OrderDetails[$scope.quantity_edit_model.selected_index].Quantity;
      $scope.quantityEditModal.show();
    };

    $scope.closeQuantityEditModal = function() {
      $scope.quantityEditModal.hide();
    };
    
    $scope.quantity_edit_model={};

    $scope.changeQuantity=function(){
        if(!$scope.quantity_edit_model.quantity)
        {
           Utils.showAlert("Quantity Edit","Please enter quantity");
           return;
        }
        $scope.order_details = $scope.order_data.OrderDetails;

        $scope.order_data.OrderDetails[$scope.quantity_edit_model.selected_index].Quantity=$scope.quantity_edit_model.quantity;
        $scope.order_details = $scope.order_data.OrderDetails;
        OrderData.setProperty($scope.order_data);
        //console.log($scope.order_data);
        $scope.closeQuantityEditModal();

        
    };


    $scope.saveOrder=function(){
           var order = OrderData.getProperty();
           var url = Utils.getApiURL("save_order");
           
           var profile_data=ProfileData.getProperty();
          
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = OrderData.getProperty();
            

        $http({
              url: Utils.getApiURL("save_order"),
              method: "POST",
              data: JSON.stringify(myJsonRequest),
              headers: {'Content-Type': 'application/json','Authorization':''+profile_data.AccessToken,'Access-Control-Allow-Origin':'*'}
            }).success(function (data, status, headers, config){
              if(data.Success)
               {
                   var alert= Utils.showAlert("Save Order",data.Message);
                   alert.then(function(res){
                       $state.go("app.dashboard");
                     });
                    $ionicLoading.hide().then(function(){
                     console.log("The loading indicator is now hidden");
                    });  
               }
               else
               {
                  $ionicLoading.hide().then(function(){
                     console.log("The loading indicator is now hidden");
                  });
                 Utils.showAlert("Save Order",data.Message);
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
 
    };
})
.controller("ServiceFloorCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,$ionicLoading,FloorModel,OrderData,$state,$ionicHistory,$stateParams){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="bill";
    $scope.items=[];
    $scope.floor_models=[];
    $scope.dine_in_data={};
    $scope.splitted_table_list=[];
    $scope.vaccant_table_list=[];
    $scope.selected_table={};
    $scope.page_referer = $stateParams.page_referer;
    console.log($stateParams);
    var current_order = OrderData.getProperty();
    if(current_order)
    {
      $scope.dine_in_data.number_of_person = current_order.NumPeople || "";
      $scope.dine_in_data.customer_phone = current_order.CustomerPhone || "";
      $scope.dine_in_data.customer_name = current_order.CustomerFirstName || "";
      $scope.dine_in_data.TableCode = current_order.OTable || "";
    }

    $scope.setSelectedTable = function(table)
    {
        $scope.selected_table = table;
        //console.log(table);
    }

    $scope.loadTableByFloor=function(){
      $scope.table_list=$scope.dine_in_data.service_floor.TableList;
      $scope.vaccant_table_list=[];
      if($scope.table_list.length>0)
      {
         for(i=0;i<$scope.table_list.length;i++){
            var table = $scope.table_list[i];
            //console.log(table);
            if($scope.page_referer=='recall_merge_order')
            {
                if(table.Status=="Occupied" && table.TableCode!=current_order.OTable)
                   $scope.vaccant_table_list.push(table);
            }
            else
            {
              if(table.Status=="Vacant")
                 $scope.vaccant_table_list.push(table);
            }
         }
      }
      $scope.splitted_table_list = Utils.chunk($scope.vaccant_table_list ,2);
      //console.log($scope.splitted_table_list);
    };


    $scope.loadTables=function(){
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = new Object();
            myJsonRequest.limit  =50;  

        $http({
            url: Utils.getApiURL("area_wise_table_list"),
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
               // console.log(data);
                   FloorModel.setProperty(data.FloorModels);
                    $scope.floor_models = data.FloorModels;
                    $scope.dine_in_data.service_floor = $scope.floor_models[0];
                    $scope.loadTableByFloor();
                   // console.log($scope.dine_in_data.service_floor); 
                 //  var d =  angular.fromJson(data.Data);
                   // $scope.categories = Utils.chunk(d ,2);
                    
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               Utils.showAlert("Search Hot Deals",data.Message);
             }
        }).error(function (data, status, headers, config) {
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }

     $scope.loadTables();

    $scope.selectServiceFloorDone=function(){
        var order = OrderData.getProperty();
       
        order.NumPeople=$scope.dine_in_data.number_of_person || "";
        order.CustomerPhone=$scope.dine_in_data.customer_phone || "";
        order.CustomerFirstName=$scope.dine_in_data.customer_name || "";
        var table = $scope.selected_table.TableCode || "";
        if(!table)
        {
          Utils.showAlert("Select Table","Please select a table",true,"warning");
          return;
        }
        order.OTable=table;
        


        OrderData.setProperty(order);
        if($scope.page_referer=='recall_order_edit'){
          $state.go("app.recall-order-edit");
        }
        else if($scope.page_referer=='recall_merge_order'){

            $scope.sendOrderMergeRequest(order);
        }
        else
          $state.go("app.order-edit");
       //  $location.path("/app/order-edit").replace();
       
    }

    $scope.goBack=function(){
      $ionicHistory.goBack();
    }

    $scope.sendOrderMergeRequest=function(order){
        var profile_data=ProfileData.getProperty();
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = new Object();
            myJsonRequest.OldOrderId  = order.OrderID;
            order.OrderID ="";
            myJsonRequest.NewOrder = order;  

        $http({
            url: Utils.getApiURL("marge_order"),
             method: "POST",
            data: JSON.stringify(myJsonRequest),
            headers: {'Content-Type': 'application/json','Authorization':''+profile_data.AccessToken,'Access-Control-Allow-Origin':'*'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
               // console.log(data);
                   var alert= Utils.showAlert("Merge Order",data.Message);
                   
                    alert.then(function(res) {
                     $state.go("app.recall");
                   });

                    
             }
             else
             {
               Utils.showAlert("Merge Order",data.Message);
             }
             $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
              });

        }).error(function (data, status, headers, config) {
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
    }  
})
.controller("ReservationCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    

})
.controller("TipsCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    
 
})
.controller("AdminToolsCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
   
})
.controller("RecallCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,$ionicLoading,OrderData,$state){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="recall";

    $scope.orders=[];

     $scope.loadOrders=function(){
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = new Object();
            myJsonRequest.limit  =50;  
        $http({
            url: Utils.getApiURL("recall_orders")+"?employeeId="+$scope.userId+"&status=1&isLoadChild=true",
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                console.log(data);
                  $scope.orders =  angular.fromJson(data.Data);
                   // console.log($scope.dine_in_data.service_floor); 
                 //  var d =  angular.fromJson(data.Data);
                   // $scope.categories = Utils.chunk(d ,2);
                    
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               Utils.showAlert("Orders",data.Message);
             }
        }).error(function (data, status, headers, config) {
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }

     $scope.loadOrders();
   
   $scope.splitDate = function(date) {
      return date.split("T").join("<br />");
    }
   
   $scope.gotoRecallEdit=function(index){
       var order = $scope.orders[index];
       OrderData.setProperty(order);
       $state.go("app.recall-order-edit");
      // console.log(order);
   };  
   
})
.controller("RecallOrderEditCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,OrderData,$document,$ionicLoading,$state,$ionicModal){
    
    $ionicSideMenuDelegate.canDragContent(false)
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="recall";
    $scope.items=[];
    $scope.order_data = OrderData.getProperty();
    $scope.order_details = $scope.order_data.OrderDetails;
    console.log($scope.order_data);
    console.log($scope.order_details);
   
    $scope.setClass = function ($event,index){
       var scope_var ="my-row-"+index;
       var my_row_element = angular.element($document[0].querySelector('#my-row-'+index));
       var my_button_element = angular.element($document[0].querySelector('#my-button-'+index));
       
       if(my_row_element.hasClass('shift-left'))
          my_row_element.removeClass('shift-left').addClass("shift-right");
       else
        my_row_element.addClass('shift-left').removeClass("shift-right");
       
       if(my_button_element.hasClass('button-shift-right'))
          my_button_element.removeClass('button-shift-right').addClass("button-shift-left");
       else
        my_button_element.addClass('button-shift-right').removeClass("button-shift-left");
    };

    $scope.removeOrderItem = function(index){
    
      $scope.order_details.splice( index, 1 );
      $scope.order_data.OrderDetails = $scope.order_details;
      OrderData.setProperty($scope.order_data);
    //  $scope.order_details.pop($scope.order_details[index]);
    };

    $scope.quantityEditModal=null;
    $ionicModal.fromTemplateUrl('templates/quantity-edit-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.quantityEditModal = modal;
    });

    
    $scope.openQuantityEditModal = function(index) {
      $scope.quantity_edit_model.selected_index=index;
      $scope.quantity_edit_model.quantity =$scope.order_data.OrderDetails[$scope.quantity_edit_model.selected_index].Quantity;
      $scope.quantityEditModal.show();
    };

    $scope.closeQuantityEditModal = function() {
      $scope.quantityEditModal.hide();
    };
    
    $scope.quantity_edit_model={};

    $scope.changeQuantity=function(){
        if(!$scope.quantity_edit_model.quantity)
        {
           Utils.showAlert("Quantity Edit","Please enter quantity");
           return;
        }
        $scope.order_details = $scope.order_data.OrderDetails;

        $scope.order_data.OrderDetails[$scope.quantity_edit_model.selected_index].quantity=$scope.quantity_edit_model.quantity;
        $scope.order_details = $scope.order_data.OrderDetails;
        OrderData.setProperty($scope.order_data);
        //console.log($scope.order_data);
        $scope.closeQuantityEditModal();

        
    };


    $scope.saveOrder=function(){
           var order = OrderData.getProperty();
           var url = Utils.getApiURL("save_order");
           
           var profile_data=ProfileData.getProperty();
          
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = OrderData.getProperty();
            

        $http({
            url: Utils.getApiURL("save_order"),
            method: "POST",
            data: JSON.stringify(myJsonRequest),
            headers: {'Content-Type': 'application/json','Authorization':''+profile_data.AccessToken,'Access-Control-Allow-Origin':'*'}

        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                 var alert= Utils.showAlert("Save Order",data.Message);
                   
                    alert.then(function(res) {
                     $state.go("app.dashboard");
                   });
                    
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
                $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });
               Utils.showAlert("Save Order",data.Message);
             }
        }).error(function (data, status, headers, config) {
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
 
    };
})
.controller("BillCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,$ionicLoading,$document,SweetAlert,$ionicModal,$state,OrderData){
    
    $ionicSideMenuDelegate.canDragContent(false);
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="bill";
    $scope.order={};
    $scope.order.serviceChargeType="amt";

    
        $scope.setClass = function ($event,index){
       var scope_var ="my-row-"+index;
       var my_row_element = angular.element($document[0].querySelector('#my-row-'+index));
       var my_button_element = angular.element($document[0].querySelector('#my-button-'+index));
       
       if(my_row_element.hasClass('shift-left'))
          my_row_element.removeClass('shift-left').addClass("shift-right");
       else
        my_row_element.addClass('shift-left').removeClass("shift-right");
       
       if(my_button_element.hasClass('button-shift-right'))
          my_button_element.removeClass('button-shift-right').addClass("button-shift-left");
       else
        my_button_element.addClass('button-shift-right').removeClass("button-shift-left");
    };

     $scope.orders=[];

     $scope.loadOrders=function(){
         $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        var myJsonRequest = new Object();
            myJsonRequest.limit  = 50;  
        $http({
            url: Utils.getApiURL("recall_orders")+"?employeeId="+$scope.userId+"&status=1&isLoadChild=true",
            method: "GET",
              headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
        }).success(function (data, status, headers, config){
            if(data.Success)
             {
                console.log(data);
                  $scope.orders =  angular.fromJson(data.Data);
                   // console.log($scope.dine_in_data.service_floor); 
                 //  var d =  angular.fromJson(data.Data);
                   // $scope.categories = Utils.chunk(d ,2);
                    
                  $ionicLoading.hide().then(function(){
                   console.log("The loading indicator is now hidden");
                });  
             }
             else
             {
               Utils.showAlert("Orders",data.Message);
             }
        }).error(function (data, status, headers, config) {
              $ionicLoading.hide().then(function(){
               console.log("The loading indicator is now hidden");
            });

        }).finally(function () {
          // Hide loading spinner whether our call succeeded or failed.
          $scope.loading = false;
        });
   }

     $scope.loadOrders();
   
   $scope.splitDate = function(date) {
      return date.split("T").join("<br />");
    }
    
    $scope.serviceChargeModal=null;
    $ionicModal.fromTemplateUrl('templates/service-charge-modal.html', {
     scope: $scope
    }).then(function(modal) {
      $scope.serviceChargeModal = modal;
      // $scope.serviceChargeModal.backdropClickToClose=false;
    });

     // Triggered in the login modal to close it
    $scope.closeServiceChargeModal = function() {
     
      $scope.serviceChargeModal.hide();
       $state.go("app.payment");
    };

    // Open the login modal
    $scope.showServiceChargeModal = function(index){
       $scope.order.order_index=index;
	   OrderData.setProperty($scope.orders[index]);
	   console.log(OrderData.getProperty());
      $scope.serviceChargeModal.show();
    };
    
    $scope.setServiceCharge=function(){
        var service_charge=$scope.order.ServiceCharge;
         if(!service_charge)
         {
          Utils.showAlert("Service Charge","Please enter service charge",false,"warning");
          return;
         }
        if($scope.order.serviceChargeType!='amt')
        {
           var amount = $scope.orders[$scope.order.order_index].OSum;
           service_charge =  amount * (service_charge/100);
        }
        
        $scope.orders[$scope.order.order_index].ServiceCharge = service_charge.toFixed(2);   
        $scope.closeServiceChargeModal();
		OrderData.setProperty($scope.orders[$scope.order.order_index]);
        $state.go("app.payment");
    };
   
})
.controller("PaymentCtrl",function($rootScope,$scope,$http,$location,$ionicSideMenuDelegate,ProfileData,Utils,$ionicLoading,$document,SweetAlert,$ionicModal,OrderData,$cordovaCamera,$filter, $cordovaFile){
    
    $ionicSideMenuDelegate.canDragContent(false);
    Utils.checkLogin();

    $scope.profile=ProfileData.getProperty();
    $scope.authenticationToken=localStorage.AccessToken;
    $scope.userId=localStorage.Id;
    $scope.selected_tab="bill";
	  $scope.order_data = OrderData.getProperty();
    // $scope.order_details = $scope.order_data.OrderDetails;
	  $scope.payment_model={};
  	$scope.payment_model.amount_due=$scope.order_data.Total;
    $scope.payment_model.amount=$scope.order_data.Total;
    $scope.payment_model.cheque_number='';
    $scope.payment_model.discount_type_per=true;
    $scope.payment_model.amt_discount_amount=0.00;
    $scope.payment_model.per_discount_amount=0.00;
    
    $scope.payment_request_model={};

	  console.log($scope.order_data);
    $scope.Utils=Utils;
	
	$scope.doPayment=function(payment_type){
    
    var myJsonRequest = new Object();
    $scope.payment_request_model.Amount=0.0;
    $scope.payment_request_model.CardHolderName="";
    $scope.payment_request_model.CardNumber="";
    $scope.payment_request_model.Ccv="";
    $scope.payment_request_model.ChequeNumber="";
    $scope.payment_request_model.ClaimCode="";
    $scope.payment_request_model.Discount=0;
    $scope.payment_request_model.ExpiryDate="";
    $scope.payment_request_model.OrderId="";
    $scope.payment_request_model.PaymentTopic="";
    $scope.payment_request_model.ReceiptNo="";
    $scope.payment_request_model.ReferenceNumber="";
    $scope.payment_request_model.ServiceCharge=0;
    $scope.payment_request_model.UploadImage="";
    $scope.payment_request_model.UploadImageType="";
    $scope.payment_request_model.UserId="";
    $scope.payment_request_model.VoucherAmount=0;
    
    if($scope.payment_model.amount<=0)
    {
      Utils.showAlert("Payment","Please enter amount");
      return;
    }

    if(payment_type=="cash")
    {
        $scope.payment_request_model.Amount = $scope.payment_model.amount;
        $scope.payment_request_model.paymentTopic = "CashPay";
        $scope.payment_request_model.Discount=$scope.order_data.Discount;
        $scope.payment_request_model.VoucherAmount = $scope.payment_model.promotional_voucher_amount || 0;
        $scope.payment_request_model.ClaimCode=$scope.payment_model.claim_code || '';
        $scope.payment_request_model.OrderId=$scope.order_data.OrderID || '';
        $scope.payment_request_model.UserId=$scope.order_data.EmployeeID || '';
        $scope.payment_request_model.ServiceCharge=$scope.order_data.ServiceCharge;

        
           
        console.log($scope.payment_request_model);
        console.log($scope.payment_model);
        return;
    }
    else if(payment_type=="check"){
         
    }
    else if(payment_type=="cc"){

    }
    else if(payment_type=="analog"){

    }

  return;
    
    myJsonRequest = $scope.payment_request_model;
     
    $ionicLoading.show({
        template: 'Loading...'
      }).then(function(){
         console.log("The loading indicator is now displayed");
      });
     
      $http({
          url: Utils.getApiURL("payment"),
          method: "GET",
          method: "POST",
          data: JSON.stringify(myJsonRequest),
          headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
      }).success(function (data, status, headers, config){
          if(data.Success)
           {
              console.log(data);
              return;
                $scope.orders =  angular.fromJson(data.Data);
                 // console.log($scope.dine_in_data.service_floor); 
               //  var d =  angular.fromJson(data.Data);
                 // $scope.categories = Utils.chunk(d ,2);
                  
                $ionicLoading.hide().then(function(){
                 console.log("The loading indicator is now hidden");
              });  
           }
           else
           {
             Utils.showAlert("Orders",data.Message);
           }
      }).error(function (data, status, headers, config) {
            $ionicLoading.hide().then(function(){
             console.log("The loading indicator is now hidden");
          });

      }).finally(function () {
        // Hide loading spinner whether our call succeeded or failed.
        $scope.loading = false;
    }); 

		  //Utils.showAlert("Payment",payment_type);
	};
	
  $scope.verifyVIPCard=function(barcode){
      var myJsonRequest = new Object();  
      myJsonRequest = $scope.payment_request_model;
     
    $ionicLoading.show({
        template: 'Loading...'
      }).then(function(){
         console.log("The loading indicator is now displayed");
      });
     
      $http({
          url: Utils.getApiURL("vip_card_details")+"?barcode="+barcode,
          method: "GET",
          headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
      }).success(function (data, status, headers, config){
           $ionicLoading.hide().then(function(){
                 console.log("The loading indicator is now hidden");
            });  
          if(data.Success)
           {
              
                var vip_card =  angular.fromJson(data.Data);
                $scope.payment_model.customer_name_on_card =""+vip_card.CustomerFirstName+" "+vip_card.CustomerLastName;
                $scope.payment_model.vip_card_percent = vip_card.DiscountPercent;
                
                var amount = $scope.payment_model.amount_due;
                var discount = amount * ($scope.payment_model.vip_card_percent /100);
                discount = parseFloat(Utils.numberFormat(discount*1,2));
                $scope.order_data.Discount=discount;

                $scope.payment_model.per_discount_amount=parseFloat(Utils.numberFormat(discount*1,2));
                $scope.payment_model.amount_due=amount-discount; 
                $scope.payment_model.amount=$scope.payment_model.amount_due; 
                
                $scope.payment_model.barcode=barcode;
                 // console.log($scope.dine_in_data.service_floor); 
               //  var d =  angular.fromJson(data.Data);
                 // $scope.categories = Utils.chunk(d ,2);
                  
               
           }
           else
           {
             Utils.showAlert("Orders",data.Message);
           }
      }).error(function (data, status, headers, config) {
            $ionicLoading.hide().then(function(){
             console.log("The loading indicator is now hidden");
          });

      }).finally(function () {
        // Hide loading spinner whether our call succeeded or failed.
        $scope.loading = false;
    }); 

  };

  $scope.verifyDiscountCoupon=function(coupon_id){
      var myJsonRequest = new Object();  
      myJsonRequest = $scope.payment_request_model;
     
    $ionicLoading.show({
        template: 'Loading...'
      }).then(function(){
         console.log("The loading indicator is now displayed");
      });
     
      $http({
          url: Utils.getApiURL("coupon_details")+"?couponId="+coupon_id,
          method: "GET",
          headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
      }).success(function (data, status, headers, config){
           $ionicLoading.hide().then(function(){
                 console.log("The loading indicator is now hidden");
            });  
          if(data.Success)
           {
                var is_coupon_allowed=false;
                var my_provision_quantity=[];
                var coupon =  angular.fromJson(data.Data);
                
                var order_details=$scope.order_data.OrderDetails;
                for(i=0;i<order_details.length;i++)
                {
                    var provision_item=order_details[i];
                    if(my_provision_quantity[provision_item.ProvisionName])
                    {
                       var my_quantity = my_provision_quantity[provision_item.ProvisionName];
                       my_provision_quantity[provision_item.ProvisionName]=provision_item.Quantity+my_quantity;
                       //console.log("true");
                    }
                    else
                    {
                        my_provision_quantity[provision_item.ProvisionName]=provision_item.Quantity;
                    }
                    //var ProvisionName
                }
                if(my_provision_quantity[coupon.ProvisionName] && parseInt(my_provision_quantity[coupon.ProvisionName])>=coupon.Quantity*1)
                {
                    is_coupon_allowed = true;
                    $scope.payment_model.coupon_policy=coupon.CouponName;
                    $scope.payment_model.coupon_discount = coupon.Discount;

                    var amount = $scope.payment_model.amount_due;
                    var discount = amount * ($scope.payment_model.coupon_discount /100);
                    discount = parseFloat(Utils.numberFormat(discount*1,2));
                    $scope.order_data.Discount=discount;

                    $scope.payment_model.amount_due=amount-discount; 
                    $scope.payment_model.amount=$scope.payment_model.amount_due; 
                    $scope.payment_model.coupon_code=coupon_id;
                    $scope.payment_model.amount_due = Utils.numberFormat($scope.payment_model.amount_due*1,2)
                    $scope.payment_model.amount = Utils.numberFormat($scope.payment_model.amount*1,2)
                }
                else
                {
                  Utils.showAlert("Coupon Verification","This coupon cannot be applied for the order");
                }
                    
           }
           else
           {
             Utils.showAlert("Verify Coupon",data.Message,false,"warning");
           }
      }).error(function (data, status, headers, config) {
            $ionicLoading.hide().then(function(){
             console.log("The loading indicator is now hidden");
          });

      }).finally(function () {
        // Hide loading spinner whether our call succeeded or failed.
        $scope.loading = false;
    }); 

  };
  $scope.payment_model.promotion_voucher_amount_enable=false;
  $scope.verifyPromotionVoucher=function(claimCode){
      var myJsonRequest = new Object();  
      myJsonRequest = $scope.payment_request_model;
     
    $ionicLoading.show({
        template: 'Loading...'
      }).then(function(){
         console.log("The loading indicator is now displayed");
      });
     
      $http({
          url: Utils.getApiURL("promotion_vocher")+"?claimCode="+claimCode,
          method: "GET",
          headers: {'Content-Type': 'application/json','Authorization':'public 1234567890'}
      }).success(function (data, status, headers, config){
           $ionicLoading.hide().then(function(){
                 console.log("The loading indicator is now hidden");
            });  
          if(data.Success)
           {
                var promotion_voucher=data.Data;
                $scope.payment_model.vendor_or_advertising_at=promotion_voucher.VendorCode;
                $scope.payment_model.promotion_voucher_balance = promotion_voucher.VoucherValue*1 - promotion_voucher.VoucherAmountUsed*1;
                $scope.payment_model.promotion_voucher_amount_enable=true;
                $scope.payment_model.claim_code= claimCode;
                
                Utils.showAlert("Promotion Voucher Verification","Verification successfull, Please enter amount.");
                    
           }
           else
           {
             Utils.showAlert("Verify Coupon",data.Message,false,"warning");
           }
      }).error(function (data, status, headers, config) {
            $ionicLoading.hide().then(function(){
             console.log("The loading indicator is now hidden");
          });

      }).finally(function () {
        // Hide loading spinner whether our call succeeded or failed.
        $scope.loading = false;
    }); 

  };

  $scope.setPromotionVoucherDiscount=function(){
    

    if($scope.payment_model.promotional_voucher_amount) 
    {
        if($scope.payment_model.promotional_voucher_amount<=$scope.payment_model.promotion_voucher_balance)
        {
          if($scope.payment_model.promotional_voucher_amount<=$scope.order_data.Total)
          {
             console.log($scope.payment_model);
              $scope.order_data.Discount=$scope.payment_model.promotional_voucher_amount;
              $scope.payment_model.amount_due=$scope.order_data.Total-$scope.payment_model.promotional_voucher_amount*1; 
              $scope.payment_model.amount=$scope.payment_model.amount_due; 
              $scope.payment_model.amount_due = Utils.numberFormat($scope.payment_model.amount_due*1,2)
                    $scope.payment_model.amount = Utils.numberFormat($scope.payment_model.amount*1,2)
             console.log($scope.payment_model);
              $scope.closePromotinoalVoucherPaymentModal();
          }
          else
             Utils.showAlert("Promotion Vocher","Discount amount is greater than the amount due.");
        }
        else
          Utils.showAlert("Promotion Vocher","Discount amount is greater than the voucher balance.");
    }
    else
      Utils.showAlert("Promotion Vocher","Please enter amount");
    
  };


  $scope.setDiscountType=function(type){
      payment_model.discount_type_per = type;

  };

  $scope.setNormaDiscount=function(val){
      var discounted_amount = 0.00;
       var total_amount = $scope.order_data.Total;
      if($scope.payment_model.discount_type_per)
      {
         
          var discount = total_amount * (val/100);
          discounted_amount = total_amount-discount;
          $scope.order_data.Discount=discount;
          $scope.payment_model.per_discount_amount=parseFloat(Utils.numberFormat(discount*1,2));
          $scope.payment_model.amount_due=discounted_amount; 

      }
      else
      {
          $scope.order_data.Discount=val;
          $scope.payment_model.amt_discount_amount=val;
          discounted_amount = total_amount-val;
         $scope.payment_model.amount_due=discounted_amount; 
      }
  };

	
	$scope.orderDetailsModal=null;
	$ionicModal.fromTemplateUrl('templates/order-details-modal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.orderDetailsModal = modal;
	});
    // Triggered in the login modal to close it
	$scope.closeOrderDetailsModal = function() {
		$scope.orderDetailsModal.hide();
	};
	// Open the login modal
	$scope.showOrderDetailsModal = function(){
		$scope.orderDetailsModal.show();
	};

    $scope.cashPaymentModal=null;
	$ionicModal.fromTemplateUrl('templates/cash-payment-modal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.cashPaymentModal = modal;
	});
    // Triggered in the login modal to close it
	$scope.closeCashPaymentModal = function() {
		$scope.cashPaymentModal.hide();
	};
	// Open the login modal
	$scope.showCashPaymentModal = function(){
		$scope.cashPaymentModal.show();
	};
	
	/*******************/
	$scope.chequePaymentModal=null;
	$ionicModal.fromTemplateUrl('templates/cheque-payment-modal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.chequePaymentModal = modal;
	});
    // Triggered in the login modal to close it
	$scope.closeChequePaymentModal = function() {
		$scope.chequePaymentModal.hide();
	};
	// Open the login modal
	$scope.showChequePaymentModal = function(){
		$scope.chequePaymentModal.show();
	};
	/***************************/
 
  /*******************/
	$scope.ccPaymentModal=null;
	$ionicModal.fromTemplateUrl('templates/cc-payment-modal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.ccPaymentModal = modal;
	});
    // Triggered in the login modal to close it
	$scope.closeCcPaymentModal = function() {
		$scope.ccPaymentModal.hide();
	};
	// Open the login modal
	$scope.showCcPaymentModal = function(){
		$scope.ccPaymentModal.show();
	};
	/***************************/

  /*******************/
  $scope.discountPromotionPaymentModal=null;
  $ionicModal.fromTemplateUrl('templates/dp-payment-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.discountPromotionPaymentModal = modal;
  });
    // Triggered in the login modal to close it
  $scope.closeDpPaymentModal = function() {
    $scope.discountPromotionPaymentModal.hide();
  };
  // Open the login modal
  $scope.showDpPaymentModal = function(){
    if($scope.order_data.Discount>0)
    {
       Utils.showAlert("Order Payment","Discount should be applied only once.",true,"warning");
       return;
    }
    $scope.discountPromotionPaymentModal.show();
  };
  /***************************/


  /*******************/
  $scope.vipCardPaymentModal=null;
  $ionicModal.fromTemplateUrl('templates/vip-card-payment-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.vipCardPaymentModal = modal;
  });
    // Triggered in the login modal to close it
  $scope.closeVipCardPaymentModal = function() {
    $scope.vipCardPaymentModal.hide();
  };
  // Open the login modal
  $scope.showVipCardPaymentModal = function(){
    $scope.closeDpPaymentModal();
    $scope.vipCardPaymentModal.show();
  };
  /***************************/

  /*******************/
  $scope.normalDiscountPaymentModal=null;
  $ionicModal.fromTemplateUrl('templates/normal-discount-payment-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.normalDiscountPaymentModal = modal;
  });
    // Triggered in the login modal to close it
  $scope.closeNormalDiscountPaymentModal = function() {
    $scope.normalDiscountPaymentModal.hide();
  };
  // Open the login modal
  $scope.showNormalDiscountPaymentModal = function(){
    $scope.closeDpPaymentModal();
    $scope.normalDiscountPaymentModal.show();
  };
  /***************************/

  /*******************/
  $scope.promotionalVoucherPaymentModal=null;
  $ionicModal.fromTemplateUrl('templates/promotional-voucher-payment-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.promotionalVoucherPaymentModal = modal;
  });
    // Triggered in the login modal to close it
  $scope.closePromotinoalVoucherPaymentModal = function() {
    $scope.promotionalVoucherPaymentModal.hide();
  };
  // Open the login modal
  $scope.showPromotinoalVoucherPaymentModal = function(){
    $scope.closeDpPaymentModal();
    $scope.promotionalVoucherPaymentModal.show();
  };
  /***************************/

  /*******************/
  $scope.couponPaymentModal=null;
  $ionicModal.fromTemplateUrl('templates/coupon-payment-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.couponPaymentModal = modal;
  });
    // Triggered in the login modal to close it
  $scope.closeCouponPaymentModal = function() {
    $scope.couponPaymentModal.hide();
  };
  // Open the login modal
  $scope.showCouponPaymentModal = function(){
    $scope.closeDpPaymentModal();
    $scope.couponPaymentModal.show();
  };
  /***************************/ 
    
	

    var date = new Date();

    $scope.current_year = date.getFullYear();
    var start = $scope.current_year - 0; // Minus 10 years from current year
    var end = $scope.current_year + 20; // Plus 10 years to current year
    $scope.yearArray = [];

    for(var i=start;i<=end;i++)
    {
    $scope.yearArray.push(i);
    }

    $scope.changeInYear = function () {
    date.setFullYear($scope.current_year);
    $scope.budgetYear = date;
    }

    $scope.current_month = date.getMonth();
    var start = 1; // Minus 1 years from current year
    var end = 12; // Plus 10 years to current year
    $scope.monthArray = [];

    for(var i=start;i<=end;i++)
    {
      $scope.monthArray.push(i);
    }

    $scope.changeInMonth = function () {
    date.setFullYear($scope.current_year);
    $scope.budgetYear = date;
    }
    



    $scope.check_image=""; 
    $scope.check_image_base64=""; 

    $scope.draw = function() {
     // Draw frame
      var dataURI;
     var img = document.getElementById('check_img');//document.querySelector(".file-preview-image")
      //img.src=image_data;

      //console.log("check_img "+image_data);
      
      console.log("img "+img.src+" w "+img.width+" h "+img.height);
      var canvas = document.createElement('canvas');
      var width=60;
      var height = (img.height/img.width)*width; 

      console.log("img source "+img.src+" w "+img.width+" h "+img.height);
      console.log("img new "+img.src+" w "+width+" h "+height);

      //var  (original height / original width) x new width = new height;
      canvas.width = width;//img.width;
      canvas.height = height;//img.height;
      canvas.getContext('2d').drawImage(img, 0,0,width,height);
      dataURI = canvas.toDataURL('image/png', 0.02);
      $scope.check_image_base64 =dataURI;
       dataURI = dataURI.replace(/^data:image\/(png|jpg);base64,/, "");
      return dataURI;
      console.log("check_image_base64 "+$scope.check_image_base64);
   
    }


      $scope.takeCameraImage = function() {
        // 2
       // $scope.showAlert("aa","aaaa");
        var options = {
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
          quality: 0.02,
          targetWidth: 200,
          targetHeight: 100,
          encodingType: Camera.EncodingType.PNG,
          popoverOptions: CameraPopoverOptions,
        };
        
        // 3
        $cordovaCamera.getPicture(options).then(function(imageData) {
         // $scope.showAlert("imageData",imageData);
          // $scope.check_image_base64 = "data:image/png;base64," + imageData;
          // 4
          onImageSuccess(imageData);
        //$scope.showAlert("imageData",imageData);
          function onImageSuccess(fileURI) {
              
            createFileEntry(fileURI);
          }
       
          function createFileEntry(fileURI) {
             //$scope.showAlert("fileURI",fileURI);
            window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
          }
       
          // 5
          function copyFile(fileEntry) {
            // $scope.showAlert("fileEntry",fileEntry);
            var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);

            var newName = makeid() + name;
       
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
              fileEntry.copyTo(
                fileSystem2,
                newName,
                onCopySuccess,
                fail
              );
            },
            fail);
          }
          
          // 6
          function onCopySuccess(entry) {
            $scope.$apply(function () {
               $scope.check_image = entry.nativeURL;
               //console.log($scope.check_image);

               //$scope.check_image_base64 = Utils.toBase64Image($scope.check_image); 
              // $scope.draw($scope.check_image); 

              // console.log("toBase64Image  "+ $scope.check_image_base64);
               
               /*
               Utils.getFileContentAsBase64(entry.nativeURL,function(base64Image){
                $scope.check_image_base64 = base64Image; 
                  $scope.draw(); 
               });*/
             
            });
          }
       
          function fail(error) {
            console.log("fail: " + error.code);
          }
       
          function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
       
            for (var i=0; i < 5; i++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
          }
       
        }, function(err) {
          console.log(err);
        });
      }

   
     $scope.urlForImage = function(imageName) {
      var trueOrigin="";
      if(imageName)
      {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        trueOrigin = cordova.file.dataDirectory + name;
      }
     //  $scope.showAlert("trueOrigin",trueOrigin);
      return trueOrigin;
    }


 

      // console.log($scope.gift_card_data); 

        $scope.requestForCheckPayment = function(){

        $scope.check_image_base64 = $scope.draw(); //return;  
	      };
       
})

.service('ProfileData', function (){
    var profileData=[];
    var loginData=[];
    return {
        getProperty: function () {
            try{
            profileData = angular.fromJson(localStorage.getItem('profileData'));
             } catch (e) {
             console.log(e); //dealData
           }
            return profileData;
        },
        setProperty: function (value) {
             value["Id"]=localStorage.Id;
             value["AccessToken"]=localStorage.getItem('AccessToken');
             value["Email"]=localStorage.getItem('Email');
             value["IsCashBack"]=localStorage.getItem('IsCashBack'); 
             try{
             localStorage.setItem('profileData', angular.toJson(value));
              } catch (e) {
             console.log(e); //dealData
           }
        }
    };
})
.service('StoreInfo', function (){
    var storeInfo=[];
    return {
        getProperty: function () {
            try{
            storeInfo = angular.fromJson(localStorage.getItem('storeInfo'));
             } catch (e) {
             console.log(e); //storeInfo
           }
            return storeInfo;
        },
        setProperty: function (value) {
             try{
             localStorage.setItem('storeInfo', angular.toJson(value));
              } catch (e) {
             console.log(e); //storeInfo
           }
        }
    };
})
.service('FloorModel', function (){
    var floorModel=[];
    return {
        getProperty: function () {
            try{
            floorModel = angular.fromJson(localStorage.getItem('floorModel'));
             } catch (e) {
             console.log(e); //floorModel
           }
            return floorModel;
        },
        setProperty: function (value) {
             try{
             localStorage.setItem('floorModel', angular.toJson(value));
              } catch (e) {
             console.log(e); //floorModel
           }
        }
    };
})
.service('ProductData', function (){
    var productData=[];
    return {
        getProperty: function () {
            try{
            productData = angular.fromJson(localStorage.getItem('productData'));
             } catch (e) {
             console.log(e); //dealData
           }
            return productData;
        },
        setProperty: function (value) {
             try{
             localStorage.setItem('productData', angular.toJson(value));
              } catch (e) {
             console.log(e); //ProductData
           }
        }
    };
})
.service('OrderData', function (){
    var orderData=[];
    return {
        getProperty: function () {
            try{
            orderData = angular.fromJson(localStorage.getItem('orderData'));
             } catch (e) {
             console.log(e); //orderData
           }
            return orderData;
        },
        setProperty: function (value) {
             try
             {
                localStorage.setItem('orderData', angular.toJson(value));
              } catch (e) {
             console.log(e); //orderData
           }
        }
    };
})
.directive('ionSearchSelect', ['$ionicModal', '$ionicGesture', function ($ionicModal, $ionicGesture) {
    return {
        restrict: 'E',
        scope: {
            options: "=",
            optionSelected: "="
        },
        controller: function ($scope, $element, $attrs) {
            $scope.searchSelect = {
                title: $attrs.title || "Search",
                keyProperty: $attrs.keyProperty,
                valueProperty: $attrs.valueProperty,
                templateUrl: $attrs.templateUrl || 'templates/search-select.html',
                animation: $attrs.animation || 'slide-in-up',
                option: null,
                searchvalue: "",
                enableSearch: $attrs.enableSearch ? $attrs.enableSearch == "true" : true
            };

            $ionicGesture.on('tap', function (e) {
              
                if(!!$scope.searchSelect.keyProperty && !!$scope.searchSelect.valueProperty){
                  if ($scope.optionSelected) {
                    $scope.searchSelect.option = $scope.optionSelected[$scope.searchSelect.keyProperty];
                  }
                }
                else{
                  $scope.searchSelect.option = $scope.optionSelected;
                }
                $scope.OpenModalFromTemplate($scope.searchSelect.templateUrl);
            }, $element);

            $scope.saveOption = function () {
              if(!!$scope.searchSelect.keyProperty && !!$scope.searchSelect.valueProperty){
                for (var i = 0; i < $scope.options.length; i++) {
                    var currentOption = $scope.options[i];
                    if(currentOption[$scope.searchSelect.keyProperty] == $scope.searchSelect.option){
                      $scope.optionSelected = currentOption;
                      break;
                    }
                }
              }
              else{
                $scope.optionSelected = $scope.searchSelect.option;
              }
                $scope.searchSelect.searchvalue = "";
                $scope.modal.remove();
            };
          
            $scope.clearSearch = function () {
                $scope.searchSelect.searchvalue = "";
            };

            $scope.closeModal = function () {
                $scope.modal.remove();
            };
            $scope.$on('$destroy', function () {
                if ($scope.modal) {
                    $scope.modal.remove();
                }
            });
          
            $scope.OpenModalFromTemplate = function (templateUrl) {
                $ionicModal.fromTemplateUrl(templateUrl, {
                    scope: $scope,
                    animation: $scope.searchSelect.animation
                }).then(function (modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            };
        }
    };
} ])
.directive('onErrorSrc', function() {
    return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.onErrorSrc) {
              attrs.$set('src', attrs.onErrorSrc);
            }
          });
        }
    }
})
.directive('checkImage', function($http,$q,Utils) {
  return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('ngSrc', function (ngSrc) {
               var deferred = $q.defer();
                var image = new Image();

                var alt_image = attrs.altSrc;

                 //console.log(alt_image);
                image.onerror = function () {
                    deferred.resolve(false);
                    element.attr('src',  alt_image || 'custom/images/no-image.png'); // set default image
                };
                image.onload = function () {
                    deferred.resolve(true);
                };
                image.src = ngSrc;
                return deferred.promise;
            });
        }
    };
 
})
.directive('ionMultipleSelect', ['$ionicModal', '$ionicGesture', function ($ionicModal, $ionicGesture) {
  return {
    restrict: 'E',
    scope: {
      options : "="
    },
    controller: function ($scope, $element, $attrs) {
      $scope.multipleSelect = {
        title:            $attrs.title || "Select Options",
        tempOptions:      [],
        keyProperty:      $attrs.keyProperty || "id",
        valueProperty:    $attrs.valueProperty || "value",
        selectedProperty: $attrs.selectedProperty || "selected",
        templateUrl:      $attrs.templateUrl || 'templates/multiple-select.html',
        renderCheckbox:   $attrs.renderCheckbox ? $attrs.renderCheckbox == "true" : true,
        animation:        $attrs.animation || 'slide-in-up',
        searchvalue: "",
        enableSearch: $attrs.enableSearch ? $attrs.enableSearch == "true" : true,
      };

      $scope.OpenModalFromTemplate = function (templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope,
          animation: $scope.multipleSelect.animation
        }).then(function (modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      };
      
      $ionicGesture.on('tap', function (e) {
       $scope.multipleSelect.tempOptions = $scope.options.map(function(option){
         var tempOption = { };
         tempOption[$scope.multipleSelect.keyProperty] = option[$scope.multipleSelect.keyProperty];
         tempOption[$scope.multipleSelect.valueProperty] = option[$scope.multipleSelect.valueProperty];
         tempOption[$scope.multipleSelect.selectedProperty] = option[$scope.multipleSelect.selectedProperty];
         
         return tempOption;
       });
        $scope.OpenModalFromTemplate($scope.multipleSelect.templateUrl);
      }, $element);
      
      $scope.saveOptions = function(){
        for(var i = 0; i < $scope.multipleSelect.tempOptions.length; i++){
          var tempOption = $scope.multipleSelect.tempOptions[i];
          for(var j = 0; j < $scope.options.length; j++){
            var option = $scope.options[j];
            if(tempOption[$scope.multipleSelect.keyProperty] == option[$scope.multipleSelect.keyProperty]){
              option[$scope.multipleSelect.selectedProperty] = tempOption[$scope.multipleSelect.selectedProperty];
              break;
            }
          }
        }
        $scope.closeModal();
      };
      $scope.clearSearch = function () {
        $scope.multipleSelect.searchvalue = "";
      };

      $scope.closeModal = function () {
        $scope.modal.remove();
      };
      $scope.$on('$destroy', function () {
          if ($scope.modal){
              $scope.modal.remove();
          }
      });
    }
  };
}])
.factory('Utils', function($q,$ionicPopup,ProfileData,$location,SweetAlert,$filter) {
    return {
        isImage: function(src) {

            var deferred = $q.defer();

            var image = new Image();
            image.onerror = function() {
                deferred.resolve(false);
            };
            image.onload = function() {
                deferred.resolve(true);
            };

          //  image.src = src;
          //  this.showAlert("",(deferred.promise) ? 't' : "f");
            return deferred.promise;
        },

        toBase64Image: function (img_path) {
            var q = $q.defer();
            window.imageResizer.resizeImage(function (success_resp) {
                console.log('success, img toBase64Image: ' + JSON.stringify(success_resp));
                q.resolve(success_resp);
            }, function (fail_resp) {
                console.log('fail, img toBase64Image: ' + JSON.stringify(fail_resp));
                q.reject(fail_resp);
            }, img_path, 1, 1, {
                imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                resizeType: ImageResizer.RESIZE_TYPE_FACTOR,
                format: 'png'
            });
         
            return q.promise;
        },

       getFileContentAsBase64: function (path,callback){
            window.resolveLocalFileSystemURL(path, gotFile, fail);
                    
            function fail(e) {
                  alert('Cannot found requested file');
            }

            function gotFile(fileEntry) {
                   fileEntry.file(function(file) {
                      var reader = new FileReader();
                      reader.onloadend = function(e) {
                           var content = this.result;
                           callback(content);
                      };
                      // The most important point, use the readAsDatURL Method from the file plugin
                      reader.readAsDataURL(file);
                   });
            }
        },
        getApiURL: function(method)
        {
            var url = {}; 
            url.base_url="http://restaurant.theskypos.com/api/";
            url.image_base_url="http://restaurant.theskypos.com";
            //url.base_url="http://d568b164.ngrok.io/api/";
            url.registration = "api/Account/Register";
            url.login_email = "Auth/Login";
            url.login_access_code="Auth/AccessCode";
            url.save_order="Order/SaveOrder";  
            url.all_category_list="Provision/AllCategoryList";  
            url.area_wise_table_list="Provision/AreaWiseTableList";
            url.all_category_list="Provision/AllCategoryList";
            url.access_code="Auth/AccessCode";
            url.order_by_id = "Order/OrderById";

            url.orders = "Order/Orders";
            url.provision_items="Provision/ProvisionItems";
            url.marge_order="Order/MargeOrder";
            url.split_order="Order/SplitOrder";
            url.delete_split_order="Order/DeleteSplitOrder";
            url.payment="Order/Payment";
            url.search_customers="Order/SearchCustomers";
            url.search_orders="Order/SearchOrders";
            url.checked_in="Order/CheckedIn";
            url.change_table="Order/ChangeTable";
            url.login="Auth/Login";
            url.table_order="Order/TableOrder";
            url.vip_card_details="Order/VipCardDetails";
            url.promotion_vocher="Order/PromotionVocher";
            url.coupon_details="Order/CouponDetails";
            url.recall_orders="Order/RecallOrders";

            url.available_tables_for_reservation="Order/AvailableTablesForReservation";
            url.daily_report="Report/DailyReport";
            url.shift_report="Report/ShiftReport";
            url.receipt_reprint="Order/ReceiptReprint";
            
            if(method=='base_url' || method=='image_base_url')
              return  url[method];  
            else if(method!=undefined || method!=null)
              return url.base_url+url[method]; 
           
            else
              return url;
        },
        showAlert : function(title,message,sweet,alert_type,show_cancel_button,confirm_button_text,cancel_button_text,close_on_confirm,close_on_cancel) {
           var sweet = sweet || false;
           if(sweet)
           {
                SweetAlert.swal({
                   title: title || 'The SkyPOS',
                   text: message || 'It might taste good',
                   type: alert_type || "success",
                   showCancelButton: show_cancel_button || false,
                   confirmButtonColor: "#004227",
                   confirmButtonText: confirm_button_text || "OK",
                   cancelButtonText: cancel_button_text || "No, cancel plx!",
                   closeOnConfirm: close_on_confirm || false,
                   closeOnCancel: close_on_cancel || false });
           }
           else
           {
               var alertPopup = $ionicPopup.alert({
                 title: title || 'The SkyPOS',
                 template: message || 'It might taste good',
                 buttons: [
                 { text: 'OK', type: 'button-positive' },
                 ]
               });

               alertPopup.then(function(res) {
                 console.log('Thank you for not eating my delicious ice cream cone');
               });
               return alertPopup;
          }
         },
        isTestMode : function()
        {
           return true;
        },
        isLoggedIn : function(){
            var profile=ProfileData.getProperty();
            var access_token=localStorage.AccessToken;
            var user_id=localStorage.Id;

            if(this.isNullOrEmpty(profile) || this.isNullOrEmpty(access_token)  || this.isNullOrEmpty(user_id) )
            {
              return false
            } 
            else return true;
        },
         checkLogin : function(){
            
            if(!this.isLoggedIn())
            {
              $location.path("/app/login").replace();
            }

         },
        isNullOrEmpty : function(data_string)
        {
            return (data_string==null || data_string==undefined || data_string == "" || !data_string || 0 === data_string.length)
        },
        chunk : function (arr, size) {
          var newArr = [];
          for (var i=0; i<arr.length; i+=size) {
            newArr.push(arr.slice(i, i+size));
          }
          return newArr;
        },
        numberFormat :function(number,decimal){
                return parseFloat($filter('number')(number, decimal));
        }

    };
})
.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        var content = element;//.find('a');
        content.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'contain',
            'background-repeat': 'repeat-x',
            'background-color' : '#e0e5e8'
        });
    };
})
.directive('currency', function () {
    return {
        require: 'ngModel',
        link: function(elem, $scope, attrs, ngModel){
            ngModel.$formatters.push(function(val){
                return '$' + val
            });
            ngModel.$parsers.push(function(val){
                return val.replace(/^\$/, '')
            });
        }
    }
})
.directive('numberFormat', function () {
     return function (scope, element, attrs) {
     attrs.$observe('value', function(actual_value) {

       var value = $filter('number')(actual_value, 2);
       attrs.$set('value',value);
       console.log(value);
     //   element.val("value = "+ actual_value);
    })
 }
})
.directive('formatMyDate', function () {
  return function (scope, element, attrs) {
     attrs.$observe('value', function(actual_value) {

       var dt = moment(actual_value, "YYYY-MM-DD").format( attrs.dataDateFormat); 
       attrs.$set('data-date',dt);
      // console.log(dt);
     //   element.val("value = "+ actual_value);
    })
 }
})

 .filter('jsonDate', ['$filter', function ($filter) {
    return function (input, format) {
        input =  moment(input).format('YYYY-MM-DD'); //new Date(input,'yyyy-MM-dd HH:mm:ss Z');
     //   console.log(input);
        return input;
       // return (input)  ? $filter('date')(parseInt(input.substr(6)), format) : '';
    };
 }])
;
