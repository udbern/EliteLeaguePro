export default {
  name: 'season',
  title: 'Season',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Season Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
     {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'startDate',
      title: 'Start Month',
      type: 'string',
      options: {
        list: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'End Month',
      type: 'string',
      options: {
        list: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Active Season',
      type: 'boolean',
      description: 'Is this the currently active season?',
      initialValue: false,
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'isActive',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? 'Active Season' : 'Past Season',
      }
    },
  },
};