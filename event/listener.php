<?php

namespace bennybernaer\copymessage\event;

use phpbb\event\data as event;
use phpbb\template\template;
use phpbb\user;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class listener implements EventSubscriberInterface
{
    public function __construct(
        protected template $template,
        protected user $user,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'core.user_setup' => 'load_language',
            'core.page_header' => 'assign_template_vars',
        ];
    }

    public function load_language(event $event): void
    {
        $lang_set_ext = $event['lang_set_ext'];
        $lang_set_ext[] = [
            'ext_name' => 'bennybernaer/copymessage',
            'lang_set' => 'common',
        ];
        $event['lang_set_ext'] = $lang_set_ext;
    }

    public function assign_template_vars(event $event): void
    {
        $style_path = (string) ($this->user->style['style_path'] ?? '');
        $page_name = basename((string) ($this->user->page['page_name'] ?? ''));

        $supported_page = in_array($page_name, [
            'posting.php',
            'viewtopic.php',
            'ucp.php',
        ], true);

        $this->template->assign_var(
            'S_COPY_MESSAGE_TEXT',
            $style_path === 'prosilver' && $supported_page
        );
    }
}
