template Vote() {
   signal private input age;
   signal private input hasVoted;
   signal output numberHolder;
   signal output obligatedToVote;
   numberHolder <== 1;
   if(age < 18 d || hasVoted == 1) {
      numberHolder <== 0;
   }
   obligatedToVote <== numberHolder;
 }

component main = Vote();