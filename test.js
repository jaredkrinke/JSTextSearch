var util = require('util');
var stream =  require('stream');

var ignorePattern = /[']/;
var breakPattern = /[^a-z0-9]/i;
var includePattern = /[a-z0-9]/i;

util.inherits(Tokenizer, stream.Readable);
function Tokenizer(input) {
    stream.Readable.call(this);
    this.setEncoding('utf8');
    this.input = input;
    input.setEncoding('utf8');

    var self = this;
    var word = '';
    input.on('end', function () {
        if (word.length > 0) {
            self.push(word);
        }

        self.push(null);
    });

    input.on('data', function (text) {
        for (var i = 0, count = text.length; i < count; i++) {
            var c = text[i];
            if (!ignorePattern.test(c)) {
                if (breakPattern.test(c) && word.length > 0) {
                    if (!self.push(word)) {
                        self.input.pause();
                    }

                    word = '';
                } else if (includePattern.test(c)) {
                    word += c;
                }
            }
        }
    });
}

Tokenizer.prototype._read = function () {
    this.input.resume();
};


var wordSet = {};
var tokenizer = new Tokenizer(process.stdin);
tokenizer.on('end', function () {
    var words = [];
    for (var word in wordSet) {
        words.push(word);
    }
    words.sort();

    for (var i = 0, count = words.length; i < count; i++) {
        console.log(words[i]);
    }
});
tokenizer.on('data', function (word) {
    wordSet[word] = true;
});

