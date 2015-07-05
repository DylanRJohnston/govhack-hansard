# govhack-hansard


### How to deploy on heroku

- `git clone git@github.com:DylanRJohnston/govhack-hansard.git`
- `heroku create`
- `git push heroku master`
- `heroku addons:create mongolab:sandbox`
- `heroku ps:scale web=1`
- `heroku open`

### API Endpoints
`https://owl-labs.herokuapp.com/search?startDate=DD/MM/YYYY&endDate=DD/MM/YYYY&limit=N`

 - `startDate`: The start date to gram transcripts from.
 - `editDate`: The end date to grab transcripts to.
 - `limit` (optional): The maximum number of transcript entries to grab. (each entry is a paragraph of text that is tagged with speaker, date and party)
 
`https://owl-labs.herokuapp.com/word_count?limit=%WORD_COUNT%`

- `%WORD_COUNT%`: The top `x` words.
