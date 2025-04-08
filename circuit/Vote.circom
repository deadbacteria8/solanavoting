template Vote() {
  signal private input voterId;
  signal output isEligible;
  var bla;
  bla = 0;
  if(voterId <= 1000 && voterId > 0) {
    bla = 1;
  }
  isEligible <== bla;
 }

component main = Vote();