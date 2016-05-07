var argv = process.argv.slice(2);
var script = argv.shift();
var max = parseInt(argv.shift());
var start = new Date();
for (var c = 0; c < max; c++) {
   require(script);
   delete require.cache;
}
var elapse = new Date().getTime() - start.getTime();
process.send({ totalElapse: elapse });
