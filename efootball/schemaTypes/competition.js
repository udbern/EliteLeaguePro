export default {
  name: 'competition',
  title: 'Competition',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Competition Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'type',
      title: 'Competition Type',
      type: 'string',
      options: {
        list: [
          { title: 'League', value: 'league' },
          { title: 'Cup', value: 'cup' },
          { title: 'Championship', value: 'championship' },
          { title: 'Friendly', value: 'friendly' }
        ]
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'seasons',
      title: 'Seasons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'season' }] }],
      validation: Rule => Rule.required().min(1),
      description: 'Select all seasons this competition is active in',
    },
    {
      name: 'isActive',
      title: 'Active Competition',
      type: 'boolean',
      description: 'Is this competition currently active?',
      initialValue: true,
    },
    {
      name: 'format',
      title: 'Competition Format',
      type: 'string',
      options: {
        list: [
          { title: 'Round Robin', value: 'round-robin' },
          { title: 'Knockout', value: 'knockout' },
          { title: 'Group Stage + Knockout', value: 'group-knockout' }
        ]
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'competitionStages',
      title: 'Competition Stages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'stageName',
              title: 'Stage Name',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'stageType',
              title: 'Stage Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Group Stage', value: 'group' },
                  { title: 'Round of 16', value: 'round-16' },
                  { title: 'Quarter Finals', value: 'quarter' },
                  { title: 'Semi Finals', value: 'semi' },
                  { title: 'Final', value: 'final' },
                  { title: 'Playoff', value: 'playoff' }
                ]
              },
              validation: Rule => Rule.required(),
            },
            {
              name: 'order',
              title: 'Stage Order',
              type: 'number',
              description: 'Order of this stage in the competition (1, 2, 3, etc.)',
              validation: Rule => Rule.required().min(1),
            },
            {
              name: 'isActive',
              title: 'Is Active',
              type: 'boolean',
              description: 'Is this stage currently active?',
              initialValue: false,
            }
          ],
          preview: {
            select: {
              title: 'stageName',
              subtitle: 'stageType'
            },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Unknown Stage',
                subtitle: subtitle || 'Unknown Type'
              }
            }
          }
        }
      ],
      description: 'Define the stages of the competition (e.g., Group Stage, Round of 16, Quarter Finals, etc.)',
      hidden: ({ document }) => document?.type !== 'cup',
    },
    {
      name: 'rounds',
      title: 'Competition Rounds',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'For simple knockout competitions, define the rounds (e.g., Quarter Finals, Semi Finals, Finals)',
      hidden: ({ document }) => document?.format !== 'knockout' || document?.type === 'cup',
    },
    {
      name: 'logo',
      title: 'Competition Logo',
      type: 'image',
      description: 'Optional logo for the competition',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the competition',
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'type',
      media: 'logo',
      seasons: 'seasons'
    },
    prepare({ title, subtitle, media, seasons }) {
      const seasonNames = seasons?.map(season => season?.name).filter(Boolean).join(', ') || 'No seasons';
      return {
        title: title || 'Unknown Competition',
        subtitle: `${subtitle} - ${seasonNames}`,
        media,
      }
    },
  },
}; 