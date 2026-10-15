import { motion } from 'framer-motion';

import { IProvince } from '../interfaces/IProvince';

interface SVGElementProps {
  shapes: IProvince[];
  onPathClick: (id: string) => void;
}

export default function SVGElement({ shapes, onPathClick }: SVGElementProps) {
  return (
    <svg viewBox='0 0 1000 350' className='size-full'>
      {shapes.map(({ id, name, d }, index) => (
        <motion.path
          key={id}
          id={id}
          d={d}
          strokeWidth='.5'
          onClick={() => onPathClick(id)}
          className='cursor-pointer transition hover:fill-white hover:stroke-[#f00]'
          initial={{ opacity: 0, pathLength: 0, fill: '#f00', stroke: '#fff' }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{
            delay: index * 0.04,
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
          }}
        >
          <title>{name}</title>
        </motion.path>
      ))}
    </svg>
  );
}
