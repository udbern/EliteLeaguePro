# Fix Season 4 Data Fetching Issues

## Tasks
- [x] Modify Teams.jsx to fetch teams directly from team documents that reference the selected season
- [x] Update CompetitionProvider to filter competitions by selected season
- [x] Ensure Fixtures page consistency with competition filtering
- [x] Fix standings and overview data for new seasons
- [x] Fix standings flashing issue when changing seasons
- [x] Test that new season 4 data appears correctly

## Information Gathered
- Teams page currently only shows teams that have fixtures in the selected season/competition
- CompetitionProvider fetches all competitions without filtering by season
- Team schema has seasons array referencing season documents
- Competition schema has seasons array referencing season documents
- New team added to season 4 but not showing because no fixtures exist yet

## Plan
1. Update Teams.jsx query to fetch teams directly: `*[_type == "team" && references($seasonId)]`
2. Update CompetitionProvider to filter competitions: `*[_type == "competition" && references($seasonId)]`
3. Verify Fixtures page works with competition filtering
4. Test the changes
