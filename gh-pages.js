var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/andmac7/calcrunch.git', // Update to point to your repository  
        user: {
            name: 'andmac7', // update to use your name
            email: 'andreas.macsotay@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)