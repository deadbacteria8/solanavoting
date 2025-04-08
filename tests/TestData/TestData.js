export default {
    TestData: () => {
        let array = [];
        for(let i = 0; i <= 1000; i++) {
            const user = {
                hasVoted: false,
                age: randomInt(18, 100)
            };
            array.push(user);
        }
        return array;
    }
}