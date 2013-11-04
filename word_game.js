//(function() {
    var columns = 4, lines = 5;
    var screen_size = $('#grid').width();
    var size = screen_size / columns;
    var tile_size = 70;
    var margin = (screen_size - columns * tile_size) / (columns + 1) / 2;
    var header = 50;

    var alphabet_points = {};


    var _alphabet = '';
    for(var k in alphabet)
        for(var i = 0; i < alphabet[k]; i++) {
            _alphabet += k;
            alphabet_points[k] = 1;
            if(~alphabet_extra_points[0].indexOf(k))
                alphabet_points[k] = 2;
            if(~alphabet_extra_points[1].indexOf(k))
                alphabet_points[k] = 3;
        }
    console.log( alphabet_points);

    var grid = location.href.split('#')[1] || [];
    if(!grid.length) {
        generateGrid();
        location.href = location.href.split('#')[0] + '#' + grid.join(',');
    } else {
        grid = grid.split(',');
    }

    function generateGrid() {
        for(var l = 0; l < lines; l++) {
            grid[l] = '';
            for(var c = 0; c < columns; c++) {
                grid[l] += _alphabet[Math.round(Math.random() * _alphabet.length)];
            }
        }
    }

    var letters = [];
    function showGrid() {
        var container = document.getElementById('grid');
        letters = [];
        for(var l = 0; l < lines; l++) {
            for(var c = 0; c < columns; c++) {
                var e = document.createElement('div');
                e.innerHTML = grid[l][c];
                e.column = c;
                e.line = l;
                e.style.top = header + l * size + 'px';
                e.style.left = margin + c * size + 'px';
                container.appendChild(e);
                letters.push(e);
            }
        }
    }

    function searchWords() {
        function search(l, c, words, current, previous) {
            current = current || '';
            previous = previous || []
            if(0 > l || l >= lines || 0 > c && c >= columns)
                return [];
            if(~previous.indexOf(l + ',' + c))
                return [];
            previous = previous.concat([l + ',' + c]);
            results = [];
            var letter = grid[l][c];
            if(!(letter in words))
                return results;
            if('\n' in words[letter])
                results.push(current + letter);
            return results
                .concat(search(l - 1, c - 1, words[letter], current + letter, previous))
                .concat(search(l - 1, c,     words[letter], current + letter, previous))
                .concat(search(l - 1, c + 1, words[letter], current + letter, previous))
                .concat(search(l    , c + 1, words[letter], current + letter, previous))
                .concat(search(l + 1, c + 1, words[letter], current + letter, previous))
                .concat(search(l + 1, c    , words[letter], current + letter, previous))
                .concat(search(l + 1, c - 1, words[letter], current + letter, previous))
                .concat(search(l    , c - 1, words[letter], current + letter, previous));
        }
        var result = [];
        for(var l = 0; l < lines; l++)
            for(var c = 0; c < columns; c++)
                search(l, c, words).forEach(function(m) {
                    if(!~result.indexOf(m))
                        result.push(m);
                });
        result.sort();
        return result;
    }

    function showStats() {
        var s = '<big>' + found.length + ' / ' + solution.length + ' mots<big><br />';
        var by_sizes  = found.reduce(function(r, a) { r[a.length] = (r[a.length] || 0) + 1; return r; }, {});
        var by_sizes2 = solution.reduce(function(r, a) { r[a.length] = (r[a.length] || 0) + 1; return r; }, {});
        found.sort();
        for(var i = 3; i < 8; i++) {
            if(by_sizes2[i]) {
                s += (by_sizes[i] || 0) + ' / ' + by_sizes2[i] + ' mots de ' + i + ' lettres<br />';
                if(show_solution) {
                    s += solution
                        .filter(function(w) { return w.length == i; })
                        .map(function(w) { return ~found.indexOf(w) ? '<strike>' + w + '</strike>' : w; })
                        .join(', ') + '<br />';
                } else {
                    s += found
                        .filter(function(w) { return w.length == i; })
                        .join(', ') + '<br />';
                }
            }
        }
        document.getElementById('results').innerHTML = s;

    }

    function start() {
        showGrid();
        solution = searchWords();
        $('#info').html(solution.length + ' mots');
    }
    
    function restart() {
        show_solution = false;
        document.getElementById('grid').innerHTML = '';
        generateGrid();
        start();
    }

    function moveBackLetters() {
        $('.top').each(function() {
            this.style.top = header + parseFloat(this.line) * size + 'px';
            this.style.left = margin + parseFloat(this.column) * size + 'px';
            this.className = '';
        });
        $('#back_sound').get(0).play();
    }

    var current = '';
    var current_words = words;
    var points_counter = 0;
    var found = [];
    var solution = [];
    var show_solution = false;
    var pl, pc, menu;
    var click = false;
    var touch = 'ontouchstart' in window;

    start();
    $('#new-game').on(touch ? 'touchstart' : 'click', restart);
    $('#resolve').on(touch ? 'touchstart' : 'click', function() {
        show_solution = true;
        showStats();
    });

    $('#grid').on(touch ? 'touchstart' : 'mousedown', function(event) {
        if(touch)
            event = event.touches[0];
        if(event.pageY < header) {
            if(menu) {
                $('#menu').hide();
                menu = false;
            } else {
                $('#menu').show();
                showStats();
                menu = true;
            }
            return;
        }
        click = true;
    }).on(touch ? 'touchmove' : 'mousemove', function(event) {
        if(!click) return;

        if(touch)
            event = event.touches[0];

        var c = (event.pageX) / size;
        var l = (event.pageY - header) / size;
        if (Math.abs((c % 1) - .5) > .17 && 
            Math.abs((l % 1) - .5) > .17)
            return;
        l = Math.floor(l);
        c = Math.floor(c);
        if(0 > l || l >= lines || 0 > c && c >= columns)
            return;

        var elem = letters[c + l * columns];
        if(elem.className == 'top')
            return;
        
        if(!current) {
            pl = l;
            pc = c;
        }
        if(Math.abs(l-pl) > 1 || Math.abs(c-pc) > 1)
            return;
        pl = l;
        pc = c;

        if(current.length == 7)
            moveBackLetters();
        
        if(current.length < 7) {
            // move the letter to the top
            elem.style.left = (screen_size - 7 * size / 2) / 2 + size / 2 * current.length - size / 4 + 'px';
            elem.style.top = 5 - size / 4 + 'px';
            elem.className = "top";
        }

        var letter = elem.innerHTML;
        current += letter;
        current_words = current_words[letter] || {};
    }).on(touch ? 'touchend' : 'mouseup', function(event)  {
        click = false;

        if(current.length < 3) {
            current = '';
            current_words = mots;
            return moveBackLetters();
        }

        if('\n' in current_words) {
            if(!~found.indexOf(current)) {
                found.push(current);
                $('#info').html(solution.length - found.length + ' words');
                $('.top').addClass('pulse');
                var points = [].slice.call(current, 0).reduce(function(p, i) {
                    console.log(i, p, alphabet_points[i]);
                    return p + alphabet_points[i];
                }, 0) + (current.length == 7 ? 1 : 0);
                points_counter += points;
                $('#points_counter').html(points_counter + ' points');
                $('#points span').html(points + ' points');
                $('#points').addClass('explode');
                $('#correct_sound').get(0).play();
                setTimeout(function() {
                    moveBackLetters();
                }, 1000);
            } else {
                moveBackLetters();
            }
        } else {
            $('.top').addClass('shake');
            $('#wrong_sound').get(0).play();
            setTimeout(moveBackLetters, 1000);
        }

        
        current = '';
        current_words = words;
    });
//})();
