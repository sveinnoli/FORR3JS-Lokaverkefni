const token = access_token

const githubgist = async () => {
  let res = await fetch('https://api.github.com/gists',{
    'headers': {'Authorization': `token ${token}`}
  })
  let data = await (res.json())
  console.log(data)
}

// 

const endpoint = "https://api.github.com/gists/ef06e5e0bb9efb83cb388d7260f840fb"
let data;

fetch(endpoint).then(results => {
    return results.json();
}).then(response => {
    data = response;
    console.log(data);
    console.log(JSON.parse(response))
}).catch(err => {
    console.log(err);
})
