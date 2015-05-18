window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

//to handle cors
var protocol = location.protocol;
var cors_server = '//zya-cors.herokuapp.com/';
cors_api_url = protocol + cors_server;

//audio nodes
var context = new AudioContext();
if (!context) {
    alert('Your browser does not support Web Audio API. Please Try Google Chrome, Safari or Firefox');
}

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};
var ios = isMobile.iOS();
var android = isMobile.Android();


var delay = new SlapDelay(context);

var masterGain = context.createGain();
var beatGain = context.createGain();
var reverbGain = context.createGain();

//individual gains
var kickGain = context.createGain();
var snareGain = context.createGain();
var hatGain = context.createGain();
var percGain = context.createGain();
var sampGain = context.createGain();

//volumes
DEFAULT_KICK_GAIN = 1
DEFAULT_HAT_GAIN = 0.3
DEFAULT_SNARE_GAIN = 0.4
DEFAULT_PERC_GAIN = 0.4
DEFAULT_SAMPLE_GAIN = 0.8

kickGain.gain.value = DEFAULT_KICK_GAIN;
reverbGain.gain.value = 0.5;
hatGain.gain.value = DEFAULT_HAT_GAIN;
snareGain.gain.value = DEFAULT_SNARE_GAIN;
percGain.gain.value = DEFAULT_PERC_GAIN;
sampGain.gain.value = DEFAULT_SAMPLE_GAIN;
delay.output.gain.value = 0.5;

//connections
kickGain.connect(beatGain);
snareGain.connect(beatGain);
hatGain.connect(beatGain);
percGain.connect(beatGain);
sampGain.connect(beatGain);
sampGain.connect(delay.input);
delay.output.connect(beatGain);

beatGain.connect(masterGain);
reverbGain.connect(masterGain);


var reverb, compressor, recorder;
if (ios || android) {

    masterGain.connect(context.destination);

} else {

    compressor = context.createDynamicsCompressor();
    compressor.ratio.value = 5;
    compressor.threshold.value = -15;

    reverb = new Reverb(context); //reverb
    beatGain.connect(reverb.convolver);
    reverb.convolver.connect(reverbGain);

    masterGain.connect(compressor);
    masterGain.gain.value = 0.9;
    compressor.connect(context.destination);
    recorder = new Recorder(compressor);

}


//global object
var global = {
    isPlaying: false
};

var gains = {
    kick: kickGain,
    snare: snareGain,
    hat: hatGain,
    perc: percGain,
    samp: sampGain
};


var l; //loop
var kick, snare, hat, perc, sample; //global
var kickParams, snareParams, hatParams, percParams, sampleParams;
var hatPattern, samplePattern, kickPattern, snarePattern, sampleOffsetPattern;

//object that holds the spinner objects
var spinners = {

    kickSpinner: null,
    snareSpinner: null,
    hatSpinner: null,
    percSpinner: null,
    sampSpinner: null

};


//choose a random tempo
var speed = (Math.random() * 3.5) + 1; // TODO qual a unidade aqui?
var quarterNote = speed / 4;
var eightNote = speed / 8;
var sixteenthNote = speed / 16;
delay.delay.delayTime.value = eightNote;

var fixedOffsets = {
    kick: null,
    snare: null,
    hihat: null
}

generateOffset2 = function (duration) {
    return (0.3 + Math.random() / 3) * duration;
}

generateOffset = function () {
    return (0.3 + Math.random() / 3);
}

//play function starts the loop
function play() {
    var bar = 0;
    //the loop function run every bar
    l = new loop(function (next) {

        for (var i = 0; i < 16; i++) {
            // TODO mexer nas duracoes
            //kick
            if (kick.loaded && kickPattern[i]) {
                kick.start(next + (sixteenthNote * i), fixedOffsets.kick * kick.buffer.duration);
                kick.stop(next + (sixteenthNote * i) + (sixteenthNote));
            }
            //snare
            if (snare.loaded && snarePattern[i]) {
                snare.start(next + (sixteenthNote * i), generateOffset2(snare.buffer.duration));
                snare.stop(next + (sixteenthNote * i) + sixteenthNote);
            }
            //hihat
            if (hat.loaded && hatPattern[i]) {
                hat.start(next + (sixteenthNote * i), generateOffset2(hat.buffer.duration));
                hat.stop(next + (sixteenthNote * i) + sixteenthNote);
            }
            //perc
            if (perc.loaded) {
                perc.start(next + (quarterNote * 3), generateOffset2(perc.buffer.duration));
                perc.stop(next + (quarterNote * 3.5));
            }
            //sample
            if (sample.loaded && samplePattern[i]) {
                var offset = sampleOffsetPattern[i] * (sample.buffer.duration);
                sample.start(next + (sixteenthNote * i), offset);
                sample.stop(next + (sixteenthNote * i) + (eightNote));
            }
        }

        console.log("bar: " + bar)
        if (bar % 15 == 0) {
            createPatterns();
            console.log("muda padrão");
        }
        bar += 1;
    }, 0, speed, context);
    beatGain.gain.value = 1;
    l.start();
}

//stop functin stops the loop
function stop() {
    l.stop();
    beatGain.gain.value = 0;
}

function drawCDQUserID() {
    var cdqUsers = ['144738660', '49552754', '120037180', '3047717', '98481236']
    return cdqUsers[Math.floor(Math.random() * cdqUsers.length)];
}

//generate search params - query,tags,durationfrom,durationto
function generateParams() {
    var max_duration = 600000; // 10 minutes max

    kickParams = generateParameters("", drawCDQUserID(), 300, max_duration);
    snareParams = generateParameters("", drawCDQUserID(), 100, max_duration);
    hatParams = generateParameters("", drawCDQUserID(), 100, max_duration);
    sampleParams = generateParameters("", drawCDQUserID(), 5000, max_duration);
    percParams = generateParameters("", drawCDQUserID(), 0, max_duration);
//  kickParams = generateParameters("kick drum","",300, 40000);
//	snareParams = generateParameters("snare","",100,30000);
//	hatParams = generateParameters("hihat","",100,30000);
//	sampleParams = generateParameters("","",5000,500000);
//	percParams = generateParameters("percussion sample","",0,30000);

}


//gets sounds and sets the link on the ui
function getSounds() {

    kick = new Sound(context, cors_api_url, kickParams, kickGain, function () {
        console.log('part 1 loaded');
        $('#kicklink').attr('href', kick.permalink);
        $('#beat1-name').html("<small>" + kick.songName + "</small>");
        spinners.kickSpinner.stop();
    });

    snare = new Sound(context, cors_api_url, snareParams, snareGain, function () {
        console.log('part 2 loaded');
        $('#snarelink').attr('href', snare.permalink);
        $('#beat2-name').html("<small>" + snare.songName + "</small>");
        spinners.snareSpinner.stop();
    });

    hat = new Sound(context, cors_api_url, hatParams, hatGain, function () {
        console.log('part 3 loaded');
        $('#hatlink').attr('href', hat.permalink);
        $('#beat3-name').html("<small>" + hat.songName + "</small>");
        spinners.hatSpinner.stop();
    });

    perc = new Sound(context, cors_api_url, percParams, percGain, function () {
        console.log('efeito loaded');
        $('#perclink').attr('href', perc.permalink);
        $('#beat4-name').html("<small>" + perc.songName + "</small>");
        spinners.percSpinner.stop();
    });

    sample = new Sound(context, cors_api_url, sampleParams, sampGain, function () {
        console.log('melodia loaded');
        $('#samplink').attr('href', sample.permalink);
        $('#beat5-name').html("<small>" + sample.songName + "</small>");
        spinners.sampSpinner.stop();
    });
}


//refreshes the patterns
function createPatterns() {
    //make new patterns
    kickPattern = generateKickPattern(0.45, [2.0, 0.2, 0.6, 0.5, 0.1, 0.2, 0.5, 0.4]);
    console.log("padrão 1: " + kickPattern);
    hatPattern = generatePattern(0.8);
    samplePattern = generatePattern(0.2);
    snarePattern = generateKickPattern(0.45, [0.2, 0.2, 0.2, 0.2, 2.0, 0.2, 1.0, 0.1])
    console.log("padrão 2: " + snareParams);

    sampleOffsetPattern = generateOffsetPattern();
    fixedOffsets.kick = generateOffset();
}

function recordStart() {
    recorder.record();
}

function recordStop() {
    recorder.stop();

    recorder.exportWAV(function (blob) {
        var randomNumber = String(Math.round(Math.random() * 100000));
        Recorder.forceDownload(blob, ['sillybeat #' + randomNumber + '.wav']);

    });

    //recorder.clear();

}
window.onload = function () {

    //initialize soundcloud sdk
    SC.initialize({
        client_id: 'e553081039dc6507a7c3ebf6211e4590',
        redirect_uri: 'http://localhost:8888/soundcloudgenerative'
    });
    //generate search parameters
    generateParams();
    //get sounds
    getSounds();
    //create Patterns
    createPatterns();
    //init gui
    guiinit(global, spinners, play, stop, getSounds, createPatterns, gains, recordStart, recordStop);

};