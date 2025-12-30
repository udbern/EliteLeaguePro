export default {
  name: 'team',
  title: 'Team',
  type: 'document',
  fields: [
    {name: 'name', title: 'Team Name', type: 'string'},
    {name: 'shortName', title: 'Short Name', type: 'string'},
    {name: 'managerName', title: 'Manager Name', type: 'string'},
    {name: 'managerPhoto', title: 'Manager Photo', type: 'image'},
    {name: 'logo', title: 'Logo', type: 'image'},
    {
      name: 'seasons',
      title: 'Seasons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'season' }] }],
      description: 'The seasons this team participates in',
    },
  ],
}
