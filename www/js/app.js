// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('skypos', ['ionic', 'skypos.controllers','ngCordova','ngCordovaOauth','ion-datetime-picker'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      var my_platform=device.platform;
      if(my_platform!="windows")
      {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      } 
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
      StatusBar.overlaysWebView(false);

    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  // $ionicConfigProvider.tabs.position('top');
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

   .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })
  .state('app.clock-in', {
    url: '/clock-in',
    views: {
      'menuContent': {
        templateUrl: 'templates/clock-in.html',
        controller: 'ClockInCtrl'
      }
    }
  })
   .state('app.clock-out', {
    url: '/clock-out',
    views: {
      'menuContent': {
        templateUrl: 'templates/clock-out.html',
        controller: 'ClockOutCtrl'
      }
    }
  })
  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    }
  })
 .state('app.order', {
    url: '/order?page_referer',
    views: {
      'menuContent': {
        templateUrl: 'templates/order.html',
        controller: 'OrderCtrl'
      }
    }
  })
  
   .state('app.order-category-item', {
    url: '/order-category-item/:category?page_referer',
    views: {
      'menuContent': {
        templateUrl: 'templates/order-category-item.html',
        controller: 'OrderCategoryItemCtrl'
      }
    }
  })
   .state('app.order-provision-item', {
    url: '/order-provision-item/:item?page_referer',
    views: {
      'menuContent': {
        templateUrl: 'templates/order-provision-item.html',
        controller: 'OrderProvisionItemCtrl'
      }
    }
  })
   .state('app.order-edit', {
    url: '/order-edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/order-edit.html',
        controller: 'OrderEditCtrl'
      }
    }
  })
  .state('app.recall', {
    url: '/recall',
    views: {
      'menuContent': {
        templateUrl: 'templates/recall.html',
        controller: 'RecallCtrl'
      }
    }
  })
  .state('app.recall-order-edit', {
    url: '/recall-order-edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/recall-order-edit.html',
        controller: 'RecallOrderEditCtrl'
      }
    }
  })
  .state('app.bill', {
    url: '/bill',
    views: {
      'menuContent': {
        templateUrl: 'templates/bill.html',
        controller: 'BillCtrl'
      }
    }
  })
  
  .state('app.split-bill-by-total', {
    url: '/split-bill-by-total',
    views: {
      'menuContent': {
        templateUrl: 'templates/split-bill-by-total.html',
        controller: 'SplitBillByTotalCtrl'
      }
    }
  })

  .state('app.split-bill-by-item', {
    url: '/split-bill-by-item',
    views: {
      'menuContent': {
        templateUrl: 'templates/split-bill-by-item.html',
        controller: 'SplitBillByItemCtrl'
      }
    }
  })

  .state('app.service-floor', {
    url: '/service-floor?page_referer',
    views: {
      'menuContent': {
        templateUrl: 'templates/service-floor.html',
        controller: 'ServiceFloorCtrl'
      }
    }
  })
  .state('app.payment', {
    url: '/payment',
    views: {
      'menuContent': {
        templateUrl: 'templates/payment.html',
        controller: 'PaymentCtrl'
      }
    }
  })

  .state('app.reservation', {
    url: '/reservation',
    views: {
      'menuContent': {
        templateUrl: 'templates/reservation.html',
        controller: 'ReservationCtrl'
      }
    }
  })
  .state('app.reservation-order', {
    url: '/reservation-order',
    views: {
      'menuContent': {
        templateUrl: 'templates/reservation-order.html',
        controller: 'ReservationOrderCtrl'
      }
    }
  })
  .state('app.tips', {
    url: '/tips',
    views: {
      'menuContent': {
        templateUrl: 'templates/tips.html',
        controller: 'TipsCtrl'
      }
    }
  })
  .state('app.adjust-tips', {
    url: '/adjust-tips',
    views: {
      'menuContent': {
        templateUrl: 'templates/tips/adjust-tips.html',
        controller: 'AdjustTipsCtrl'
      }
    }
  })
  .state('app.validate-tips', {
    url: '/validate-tips',
    views: {
      'menuContent': {
        templateUrl: 'templates/tips/validate-tips.html',
        controller: 'ValidateTipsCtrl'
      }
    }
  })
  .state('app.admin_tools', {
    url: '/admin_tools',
    views: {
      'menuContent': {
        templateUrl: 'templates/admin_tools.html',
        controller: 'AdminToolsCtrl'
      }
    }
  })
 
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});
