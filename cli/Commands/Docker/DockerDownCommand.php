<?php

namespace App\Commands\Docker;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class DockerDownCommand extends DockerCommand
{
    protected function configure()
    {
        parent::configure();
        
        $this
            ->setName('docker:down')
            ->setDescription('destroy docker setup.  stop containers, remove containers and networks, volumes will persist, DATABASE WILL BE LOST')
            ->setHelp('')
            ->addOption('yes_i_am_sure', '', InputOption::VALUE_NONE, 'Confirm that you are sure');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('yes_i_am_sure')) {
            $output->writeln('<error>You have to be really sure to execute this command. Use the --yes_i_am_sure option to confirm.</error>');
            return 1;
        }

        parent::execute($input, $output);
        passthru($this->getComposeString() . ' down', $result_code);

        return $result_code;
    }
}

