export default {
  name: 'fixture',
  title: 'Fixture',
  type: 'document',
  fields: [
    {
      name: 'season',
      title: 'Season',
      type: 'reference',
      to: [{ type: 'season' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'competition',
      title: 'Competition',
      type: 'reference',
      to: [{ type: 'competition' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'homeTeam',
      title: 'Home Team',
      type: 'reference',
      to: [{ type: 'team' }],
    },
    {
      name: 'awayTeam',
      title: 'Away Team',
      type: 'reference',
      to: [{ type: 'team' }],
    },
    {
      name: 'homeScore',
      title: 'Home Score',
      type: 'number',
      validation: Rule => Rule.min(0),
    },
    {
      name: 'awayScore',
      title: 'Away Score',
      type: 'number',
      validation: Rule => Rule.min(0),
    },
    {
      name: 'matchDate',
      title: 'Match Date',
      type: 'datetime',
    },
    {
      name: 'round',
      title: 'Round',
      type: 'string',
    },
    {
      name: 'group',
      title: 'Group',
      type: 'string',
      description: 'For group stages, specify the group (e.g., "Group A", "Group B", "Group C")',
      hidden: ({ document }) => !document?.round?.toLowerCase().includes('group'),
    },
    {
      name: 'status',
      title: 'Match Status',
      type: 'string',
      options: {
        list: [
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'Completed', value: 'completed' },
          { title: 'Postponed', value: 'postponed' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      initialValue: 'scheduled',
    },
    
    {
      name: 'homeGoalScorers',
      title: 'Home Goal Scorers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'playerName',
              title: 'Player Name',
              type: 'string'
            },
            {
              name: 'goals',
              title: 'Number of Goals',
              type: 'number',
              validation: Rule => Rule.min(1)
            },
            {
              name: 'team',
              title: 'Team',
              type: 'reference',
              to: [{ type: 'team' }]
            }
          ]
        }
      ]
    },
    {
      name: 'awayGoalScorers',
      title: 'Away Goal Scorers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'playerName',
              title: 'Player Name',
              type: 'string'
            },
            {
              name: 'goals',
              title: 'Number of Goals',
              type: 'number',
              validation: Rule => Rule.min(1)
            },
            {
              name: 'team',
              title: 'Team',
              type: 'reference',
              to: [{ type: 'team' }]
            }
          ]
        }
      ]
    },
    {
      name: 'homeTeamStats',
      title: 'Home Team Statistics',
      type: 'object',
      fields: [
        {
          name: 'possession',
          title: 'Possession (%)',
          type: 'number',
          validation: Rule => Rule.min(0).max(100),
        },
        {
          name: 'shots',
          title: 'Total Shots',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'shotsOnTarget',
          title: 'Shots on Target',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'corners',
          title: 'Corners',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'fouls',
          title: 'Fouls',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'yellowCards',
          title: 'Yellow Cards',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'redCards',
          title: 'Red Cards',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'offsides',
          title: 'Offsides',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'passes',
          title: 'Total Passes',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'successfulPass',
          title: 'Successful Passes',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'freeKicks',
          title: 'Free Kicks',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'crosses',
          title: 'Crosses',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'interceptions',
          title: 'Interceptions',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'tackles',
          title: 'Tackles',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'saves',
          title: 'Saves',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
      ],
    },
    {
      name: 'awayTeamStats',
      title: 'Away Team Statistics',
      type: 'object',
      fields: [
        {
          name: 'possession',
          title: 'Possession (%)',
          type: 'number',
          validation: Rule => Rule.min(0).max(100),
        },
        {
          name: 'shots',
          title: 'Total Shots',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'shotsOnTarget',
          title: 'Shots on Target',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'corners',
          title: 'Corners',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'fouls',
          title: 'Fouls',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'yellowCards',
          title: 'Yellow Cards',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'redCards',
          title: 'Red Cards',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'offsides',
          title: 'Offsides',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'passes',
          title: 'Total Passes',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'successfulPass',
          title: 'Successful Passes',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'freeKicks',
          title: 'Free Kicks',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'crosses',
          title: 'Crosses',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'interceptions',
          title: 'Interceptions',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'tackles',
          title: 'Tackles',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
        {
          name: 'saves',
          title: 'Saves',
          type: 'number',
          validation: Rule => Rule.min(0),
        },
      ],
    },
    
  ],
  preview: {
    select: {
      title: 'round',
      subtitle: 'season.name',
      homeTeam: 'homeTeam.name',
      awayTeam: 'awayTeam.name',
      competition: 'competition.name',
    },
    prepare({ title, subtitle, homeTeam, awayTeam, competition }) {
      return {
        title: `${homeTeam} vs ${awayTeam}`,
        subtitle: `${competition} - ${subtitle} - ${title}`,
      }
    },
  },
};