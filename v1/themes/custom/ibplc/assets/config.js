/*global require*/
'use strict';

var require = {
  baseUrl: '/etc/designs/universaltemplateFooterclientLibs/public/js',
  waitSeconds: 20,

  shim: {
    ageGateController       : ['mobiscrollPlugin', 'sliderPlugin'],
    sliderPlugin            : [],
    mobiscrollPlugin        : [],
    gigyaAccountHelper      : [],
    carouselWithThumbnail   : ['sliderPlugin'],
    raas                    : ['jqueryValidateAdditionalMethods', 'i18n/dictionaryShim'],
    jqueryValidate          : ['jquery'],
    jqueryCustomScroll      : ['jquery'],
    ThumbnailScroller       : ['jquery'],
    jqueryValidateAdditionalMethods : ['jqueryValidateAdditionalMethodsABI'],
    jqueryValidateAdditionalMethodsABI : ['jqueryValidate'],
    jquerySimpleWeather     : ['jquery'],
    modernizr               : {exports: 'Modernizr'},
    masonry                 : {exports: 'Masonry'}
  },

  paths: {
    /* alternative routes */
    templates                       : '../templates',

    /* require-conf */
    json                            : 'plugins/require-plugins/json',
    session                         : '/apps/universaltemplate-session/require',
    external                        : '/apps/universaltemplate-external/require',
    containers                      : '/apps/universaltemplate-containers/require',

    /* plugins */
    sliderPlugin                    : 'plugins/slider',
    mobiscrollPlugin                : 'plugins/mobiscroll.full.min',
    jqueryValidate                  : 'plugins/jquery.validate',
    jqueryValidateAdditionalMethods : 'plugins/jquery.validate.additional-methods',
    jqueryValidateAdditionalMethodsABI : 'plugins/jquery.validate.additional-methods-ABI',
    jqueryStellar                   : 'plugins/jquery.stellar.min',
    jqueryCustomScroll              : 'plugins/jquery.mCustomScrollbar.concat.min',
    hbs                             : 'plugins/require-plugins/hbs',
    throttleDebounce                : 'plugins/jquery.ba-throttle-debounce.min',
    drags                           : 'plugins/jquery.drags',
    typeaHead                       : 'plugins/typeahead',
    jquerySimpleWeather             : 'plugins/jquery.simpleWeather',
    modernizr                       : 'plugins/modernizr.custom',
    masonry                         : 'plugins/masonry.pkgd.min',
    ThumbnailScroller               : 'plugins/jquery.mThumbnailScroller',
    jqueryInfinitScroll             : 'plugins/jquery.infinitescroll',
    jqueryeasing                    : 'plugins/jquery.easing.min',
    tocca                           : 'plugins/Tocca.min',
    clearSearch                     : 'plugins/jquery.clearsearch',
    slick_1_6_0                     : 'plugins/slick.1.6.0',
    //  slick_1_8                       : ' slick.1.8.min.js',
   

    /* modules */
    ageGateModule                   : 'modules/ageGate',
    raas                            : raasModulePath,
    carouselWithThumbnail           : 'modules/carouselWithThumbnail',
    countrySelector                 : 'modules/countrySelector',
    productLocator                  : 'modules/productLocator',
    customBg                        : 'modules/customBg',
    md5                  			      : 'modules/md5',
    sha256							            : 'modules/sha256',

    /* controllers */
    ageGateController               : 'controllers/ageGate',
    windowController                : 'controllers/window',
    montejoHomeAppController        : 'controllers/pages/montejo/homeApp',

    /* AgeCheckers addons */
    efridgeAgeGateAddon             : 'addons/ageCheckerComponent/efridge/addon',
    budweiserAgeGateAddon           : 'addons/ageCheckerComponent/budweiser/addon',
    budlightAgeGateAddon            : 'addons/ageCheckerComponent/budlight/addon',
    michelobultraAgeGateAddon       : 'addons/ageCheckerComponent/michelobultra/addon',
    stellagreatesteventsAgeGateAddon: 'addons/ageCheckerComponent/stellagreatestevents/addon',
    coronaextraAgeGateAddon         : 'addons/ageCheckerComponent/coronaextra/addon',
    jappleseedAgeGateAddon          : 'addons/ageCheckerComponent/jappleseed/addon',
    montejoAgeGateAddon             : 'addons/ageCheckerComponent/montejo/addon',
    naturallightAgeGateAddon        : 'addons/ageCheckerComponent/naturallight/addon',
    abinbevAgeGateAddon             : 'addons/ageCheckerComponent/abinbev/addon',
    shocktopAgeGateAddon            : 'addons/ageCheckerComponent/shocktop/addon',
    stellaartoisAgeGateAddon        : 'addons/ageCheckerComponent/stellaartois/addon',
    grantsfarmAgeGateAddon          : 'addons/ageCheckerComponent/grantsfarm/addon',
    warmspringsranchAgeGateAddon    : 'addons/ageCheckerComponent/warmspringsranch/addon',
    budweisertoursAgeGateAddon      : 'addons/ageCheckerComponent/budweisertours/addon',
    rollingrockAgeGateAddon         : 'addons/ageCheckerComponent/rollingrock/addon',
    defaultAgeGateAddon             : 'addons/ageCheckerComponent/default/addon',
    ocultoAgeGateAddon              : 'addons/ageCheckerComponent/oculto/addon',
    buschAgeGateAddon               : 'addons/ageCheckerComponent/busch/addon',
    budweiser1AgeGateAddon          : 'addons/ageCheckerComponent/budweiser1/addon',
    bestdamnAgeGateAddon            : 'addons/ageCheckerComponent/bestdamn/addon',
    tackleimpossibleAgeGateAddon    : 'addons/ageCheckerComponent/tackleimpossible/addon',
    estrellaAgeGateAddon            : 'addons/ageCheckerComponent/estrella/addon',
    bonandvivAgeGateAddon           : 'addons/ageCheckerComponent/bonandviv/addon',
    loyaltyAgeGateAddon             : 'addons/ageCheckerComponent/loyalty/addon',
    'corona-globalAgeGateAddon'     : 'addons/ageCheckerComponent/corona-global/addon',
    'ab-inbevAgeGateAddon'          : 'addons/ageCheckerComponent/ab-inbev/addon',
    'budlight-caAgeGateAddon'		    : 'addons/ageCheckerComponent/budlight-ca/addon',
    'budweiser-caAgeGateAddon'		  : 'addons/ageCheckerComponent/budweiser-ca/addon',
    'michelobultra-caAgeGateAddon'  : 'addons/ageCheckerComponent/michelobultra-ca/addon',
    'team-ultraAgeGateAddon'  	    : 'addons/ageCheckerComponent/michelobteamultra/addon',
    'landsharklagerAgeGateAddon'    : 'addons/ageCheckerComponent/landsharklager/addon',
    'lime-a-ritaAgeGateAddon'       : 'addons/ageCheckerComponent/limearita/addon',
    'hiballerAgeGateAddon'          : 'addons/ageCheckerComponent/hiballer/addon',
    'patagoniaAgeGateAddon'         : 'addons/ageCheckerComponent/patagonia/addon',
    'drinklqdAgeGateAddon'          : 'addons/ageCheckerComponent/lqd/addon',
    countryListJson                 : 'modules/emptyCountryListJson.js',

    /* Configs */
    landingpageStellarConfig        : 'configs/landingpageStellar',
    horizontalParallaxStellarConfig : 'configs/horizontalParallaxStellar',
    imageComponentStellarConfig     : 'configs/imageComponentStellar'
  }
};
