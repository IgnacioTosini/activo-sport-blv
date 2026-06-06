import './_title.scss';

interface Props {
  text: string;
  subTitle?: string;
}

export const Title = ({ text, subTitle }: Props) => {
  return (
    <div className='title'>
      <div className='intro'>{text}</div>
      {subTitle && <h2 className='subtitle'>{subTitle}</h2>}
    </div>
  )
}
