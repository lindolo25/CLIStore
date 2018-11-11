String.prototype.format = String.prototype.f = function() 
{
    var s = this,
    i = arguments.length;
   
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
}

Array.prototype.indexOfKeyValue = Array.prototype.f = function(key, value)
{
    var s = this;
    for(var i = 0; i < s.length; i++)
    {
        var item = s[i];
        if(item[key] === value)
        {
            return i;
        }
    }

    return null;
}