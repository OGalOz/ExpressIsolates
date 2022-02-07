

function hashString(S) {
    var hash = 0;
    for (var i = 0; i < S.length; i++) {
        var char = S.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


